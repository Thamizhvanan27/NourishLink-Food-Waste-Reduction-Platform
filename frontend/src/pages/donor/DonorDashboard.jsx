import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import donorService from '../../services/donorService';
import donationService from '../../services/donationService';
import StatusBadge from '../../components/StatusBadge';

const DonorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await donorService.getDashboard();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await donationService.deleteDonation(deleteId);
      toast.success('Donation deleted successfully');
      setDeleteId(null);
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to delete donation');
    }
  };

  if (loading) {
    return (
      <div className="py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="font-heading fw-bold mb-1">Donor Dashboard</h2>
          <p className="text-muted small mb-0">Track and manage your surplus food donations</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/donor/donations/create" className="btn btn-primary-custom py-2 px-3 shadow-sm">
            <i className="bi bi-plus-lg me-1"></i> New Food Donation
          </Link>
          <Link to="/donor/requests" className="btn btn-secondary-custom py-2 px-3">
            <i className="bi bi-inbox me-1"></i> Incoming Requests
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-2 col-6">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small">Total</span>
              <div className="stat-icon bg-light text-dark" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-collection"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold font-heading">{stats?.totalDonations || 0}</div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-2 col-6">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small">Available</span>
              <div className="stat-icon bg-success bg-opacity-10 text-success" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-check-circle"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold text-success font-heading">{stats?.availableDonations || 0}</div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-2 col-6">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small">Requested</span>
              <div className="stat-icon bg-warning bg-opacity-10 text-warning" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-hourglass-split"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold text-warning font-heading">{stats?.requestedDonations || 0}</div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-2 col-6">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small">Accepted</span>
              <div className="stat-icon bg-info bg-opacity-10 text-info" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-check-all"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold text-info font-heading">{stats?.acceptedDonations || 0}</div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-2 col-6">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small">Completed</span>
              <div className="stat-icon bg-teal bg-opacity-10 text-teal" style={{ width: '36px', height: '36px', backgroundColor: '#ccfbf1', color: '#0f766e' }}>
                <i className="bi bi-award-fill"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold font-heading" style={{ color: '#0f766e' }}>{stats?.completedDonations || 0}</div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-2 col-6">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small">Cancelled</span>
              <div className="stat-icon bg-danger bg-opacity-10 text-danger" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-x-circle"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold text-danger font-heading">{stats?.cancelledDonations || 0}</div>
          </div>
        </div>
      </div>

      {/* Recent Donations Table */}
      <div className="card custom-card p-4 border-0 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="font-heading fw-bold mb-0">Recent Food Donations</h5>
          <Link to="/donor/donations" className="btn btn-sm btn-outline-secondary">
            View All <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>

        {stats?.recentDonations && stats.recentDonations.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-muted">
                  <th>Food</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentDonations.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {d.imageUrl ? (
                          <img src={d.imageUrl} alt="" className="rounded-2" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                        ) : (
                          <div className="rounded-2 bg-light d-flex align-items-center justify-content-center text-muted" style={{ width: '40px', height: '40px' }}>
                            <i className="bi bi-box"></i>
                          </div>
                        )}
                        <div>
                          <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '200px' }}>{d.foodName}</div>
                          <span className={d.foodType === 'VEGETARIAN' ? 'veg-badge' : 'non-veg-badge'}>
                            {d.foodType === 'VEGETARIAN' ? 'Veg' : 'Non-Veg'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge bg-light text-dark border">{d.category?.name || 'General'}</span></td>
                    <td className="fw-semibold text-success">{d.quantity} {d.quantityUnit}</td>
                    <td className="small text-danger fw-semibold">
                      {new Date(d.expiryDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td><StatusBadge status={d.status} /></td>
                    <td className="small text-muted">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <Link to={`/donations/${d.id}`} className="btn btn-outline-secondary" title="View Details">
                          <i className="bi bi-eye"></i>
                        </Link>
                        {d.status !== 'COMPLETED' && (
                          <Link to="/donor/donations" className="btn btn-outline-primary" title="Manage / Edit">
                            <i className="bi bi-pencil"></i>
                          </Link>
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
        ) : (
          <div className="text-center py-5 bg-light rounded-3">
            <i className="bi bi-box2 display-6 text-muted"></i>
            <h6 className="mt-3 fw-bold font-heading">No food donations listed yet</h6>
            <p className="text-muted small mb-3">Create your first surplus food donation to start rescuing meals.</p>
            <Link to="/donor/donations/create" className="btn btn-primary-custom btn-sm">
              + Donate Food
            </Link>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title font-heading fw-bold text-danger">Delete Food Donation</h5>
                <button type="button" className="btn-close" onClick={() => setDeleteId(null)}></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this donation?
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-secondary-custom py-2" onClick={() => setDeleteId(null)}>Cancel</button>
                <button type="button" className="btn btn-danger py-2" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;
