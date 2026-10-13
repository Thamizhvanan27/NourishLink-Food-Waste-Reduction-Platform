import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';
import categoryService from '../../services/categoryService';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [foodTypeFilter, setFoodTypeFilter] = useState('');
  const [keyword, setKeyword] = useState('');

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchDonations();
  }, [page, statusFilter, categoryFilter, foodTypeFilter]);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getActiveCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 10,
        status: statusFilter || undefined,
        categoryId: categoryFilter || undefined,
        foodType: foodTypeFilter || undefined,
        keyword: keyword || undefined
      };
      const res = await adminService.getAllDonations(params);
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

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminService.deleteDonation(deleteId);
      toast.success('Inappropriate donation deleted successfully');
      setDeleteId(null);
      fetchDonations();
    } catch (err) {
      toast.error('Failed to delete donation');
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="font-heading fw-bold mb-1">Platform Food Donations</h2>
          <p className="text-muted small mb-0">Oversee all food listings, enforce safety standards, and moderate content</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card custom-card p-3 mb-4 bg-white border-0 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="row g-2">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search food, donor, city..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
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

          <div className="col-md-3">
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="col-md-2 d-flex gap-2">
            <button type="submit" className="btn btn-primary-custom flex-grow-1 justify-content-center py-2">
              Filter
            </button>
            {(keyword || statusFilter || categoryFilter || foodTypeFilter) && (
              <button
                type="button"
                className="btn btn-secondary-custom"
                onClick={() => {
                  setKeyword('');
                  setStatusFilter('');
                  setCategoryFilter('');
                  setFoodTypeFilter('');
                  setPage(0);
                }}
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Donations Table */}
      <div className="card custom-card p-4 border-0 shadow-sm bg-white">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading platform listings...</span>
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
                    <th>Donor Name</th>
                    <th>Quantity</th>
                    <th>Location</th>
                    <th>Expiry</th>
                    <th>Status</th>
                    <th className="text-end">Moderation</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d) => (
                    <tr key={d.id}>
                      <td className="fw-bold small text-muted">#{d.id}</td>
                      <td>
                        <div className="fw-semibold text-dark">{d.foodName}</div>
                        <span className="badge bg-light text-dark border me-1">{d.category?.name}</span>
                        <span className={d.foodType === 'VEGETARIAN' ? 'veg-badge' : 'non-veg-badge'}>
                          {d.foodType === 'VEGETARIAN' ? 'Veg' : 'Non-Veg'}
                        </span>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark small">{d.donor?.fullName}</div>
                        <div className="small text-muted">{d.donor?.email}</div>
                      </td>
                      <td className="fw-semibold text-success">
                        {d.quantity} {d.quantityUnit}
                      </td>
                      <td className="small text-secondary">
                        <i className="bi bi-geo-alt me-1 text-danger"></i>
                        {d.city}
                      </td>
                      <td className="small text-danger fw-semibold">
                        {new Date(d.expiryDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>
                        <StatusBadge status={d.status} />
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <Link to={`/donations/${d.id}`} className="btn btn-outline-secondary" title="View Full Details">
                            <i className="bi bi-eye"></i>
                          </Link>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            title="Delete Inappropriate Listing"
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
            <i className="bi bi-box-seam display-6 text-muted"></i>
            <h6 className="mt-3 fw-bold font-heading">No donations found</h6>
            <p className="text-muted small">No food donations match the specified search parameters.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title font-heading fw-bold text-danger">Admin Moderation: Delete Donation</h5>
                <button type="button" className="btn-close" onClick={() => setDeleteId(null)}></button>
              </div>
              <div className="modal-body">
                Are you sure you want to remove this donation listing from the platform?
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-secondary-custom py-2" onClick={() => setDeleteId(null)}>Cancel</button>
                <button type="button" className="btn btn-danger py-2" onClick={handleDelete}>Delete Listing</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDonations;
