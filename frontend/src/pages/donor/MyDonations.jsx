import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import donationService from '../../services/donationService';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';

const MyDonations = () => {
  const [donations, setDonations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editingDonation, setEditingDonation] = useState(null);
  const [editFoodName, setEditFoodName] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchDonations();
  }, [page, statusFilter]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 10,
        status: statusFilter || undefined,
        keyword: keyword || undefined
      };
      const res = await donationService.getMyDonations(params);
      if (res.success && res.data) {
        setDonations(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchDonations();
  };

  const openEditModal = (donation) => {
    setEditingDonation(donation);
    setEditFoodName(donation.foodName);
    setEditQuantity(donation.quantity);
    setEditAddress(donation.pickupAddress);
    setEditCity(donation.city);
    setEditDescription(donation.description || '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingDonation) return;

    try {
      setSavingEdit(true);
      const res = await donationService.updateDonation(editingDonation.id, {
        foodName: editFoodName,
        quantity: parseFloat(editQuantity),
        pickupAddress: editAddress,
        city: editCity,
        description: editDescription
      });

      if (res.success) {
        toast.success('Donation updated successfully');
        setEditingDonation(null);
        fetchDonations();
      } else {
        toast.error(res.message || 'Update failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error updating donation';
      toast.error(msg);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await donationService.deleteDonation(deleteId);
      toast.success('Donation deleted successfully');
      setDeleteId(null);
      fetchDonations();
    } catch (err) {
      toast.error('Error deleting donation');
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="font-heading fw-bold mb-1">My Food Donations</h2>
          <p className="text-muted small mb-0">View, search, edit, or delete your food donation listings</p>
        </div>
        <Link to="/donor/donations/create" className="btn btn-primary-custom py-2 px-3">
          <i className="bi bi-plus-lg me-1"></i> New Food Donation
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card custom-card p-3 mb-4 bg-white border-0 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by food name or city..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-4">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="REQUESTED">REQUESTED</option>
              <option value="ACCEPTED">ACCEPTED</option>
              <option value="PICKED_UP">PICKED_UP</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="col-md-3 d-flex gap-2">
            <button type="submit" className="btn btn-primary-custom flex-grow-1 justify-content-center py-2">
              Filter
            </button>
            {(keyword || statusFilter) && (
              <button
                type="button"
                className="btn btn-secondary-custom"
                onClick={() => {
                  setKeyword('');
                  setStatusFilter('');
                  setPage(0);
                }}
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="card custom-card p-4 border-0 shadow-sm bg-white">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : donations.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr className="small text-muted">
                    <th>ID</th>
                    <th>Food Item</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Expiry Timestamp</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d) => (
                    <tr key={d.id}>
                      <td className="fw-bold small text-muted">#{d.id}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {d.imageUrl ? (
                            <img src={d.imageUrl} alt="" className="rounded-2" style={{ width: '42px', height: '42px', objectFit: 'cover' }} />
                          ) : (
                            <div className="rounded-2 bg-light d-flex align-items-center justify-content-center text-muted" style={{ width: '42px', height: '42px' }}>
                              <i className="bi bi-box"></i>
                            </div>
                          )}
                          <div>
                            <Link to={`/donations/${d.id}`} className="fw-semibold text-dark text-decoration-none">
                              {d.foodName}
                            </Link>
                            <div className="mt-1">
                              <span className={d.foodType === 'VEGETARIAN' ? 'veg-badge' : 'non-veg-badge'}>
                                {d.foodType === 'VEGETARIAN' ? 'Veg' : 'Non-Veg'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {d.category?.name || 'General'}
                        </span>
                      </td>
                      <td className="fw-semibold text-success">
                        {d.quantity} {d.quantityUnit}
                      </td>
                      <td className="small text-danger fw-semibold">
                        {new Date(d.expiryDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>
                        <StatusBadge status={d.status} />
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <Link to={`/donations/${d.id}`} className="btn btn-outline-secondary" title="View Details">
                            <i className="bi bi-eye"></i>
                          </Link>
                          {d.status !== 'COMPLETED' && (
                            <button
                              type="button"
                              className="btn btn-outline-primary"
                              title="Edit"
                              onClick={() => openEditModal(d)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            title="Delete"
                            onClick={() => setDeleteId(d.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-inbox display-6 text-muted"></i>
            <h6 className="mt-3 fw-bold font-heading">No donations matched your criteria</h6>
            <p className="text-muted small">Try modifying your filter or list a new donation.</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingDonation && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title font-heading fw-bold">Edit Food Donation</h5>
                <button type="button" className="btn-close" onClick={() => setEditingDonation(null)}></button>
              </div>
              <form onSubmit={handleSaveEdit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label fw-semibold small">Food Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFoodName}
                        onChange={(e) => setEditFoodName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">Quantity</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0.1"
                        className="form-control"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-8">
                      <label className="form-label fw-semibold small">Pickup Address</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold small">Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-secondary-custom py-2" onClick={() => setEditingDonation(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-custom py-2" disabled={savingEdit}>
                    {savingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title font-heading fw-bold text-danger">Delete Food Donation</h5>
                <button type="button" className="btn-close" onClick={() => setDeleteId(null)}></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this donation? This action cannot be undone.
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-secondary-custom py-2" onClick={() => setDeleteId(null)}>Cancel</button>
                <button type="button" className="btn btn-danger py-2" onClick={handleDelete}>Delete Permanently</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDonations;
