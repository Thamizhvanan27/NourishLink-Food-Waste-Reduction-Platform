import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ngoService from '../../services/ngoService';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

const NgoDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await ngoService.getDashboard();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      toast.error('Failed to load NGO dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading NGO dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="font-heading fw-bold mb-1">NGO Operations Dashboard</h2>
          <p className="text-muted small mb-0">Browse food donations, manage distribution, and feed community members</p>
        </div>
        <div>
          <Link to="/ngo/donations" className="btn btn-primary-custom py-2 px-3 shadow-sm">
            <i className="bi bi-search me-1"></i> Browse Available Food
          </Link>
        </div>
      </div>

      {!user?.approved && (
        <div className="alert alert-warning border-0 p-4 rounded-4 mb-4 shadow-sm">
          <div className="d-flex align-items-start gap-3">
            <i className="bi bi-shield-exclamation fs-2 text-warning flex-shrink-0"></i>
            <div>
              <h5 className="font-heading fw-bold text-dark mb-1">Account Pending Admin Approval</h5>
              <p className="text-secondary small mb-2">
                Your NGO registration is undergoing validation by platform administrators.
                Once approved, you will be able to submit food collection requests immediately.
              </p>
              <Link to="/ngo/profile" className="btn btn-sm btn-outline-dark">
                Review Profile Information
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl col-6">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small">Available Food</span>
              <div className="stat-icon bg-success bg-opacity-10 text-success" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-box-seam"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold text-success font-heading">{stats?.availableDonations || 0}</div>
          </div>
        </div>

        <div className="col-sm-6 col-xl col-6">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small">Pending Requests</span>
              <div className="stat-icon bg-warning bg-opacity-10 text-warning" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-hourglass-split"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold text-warning font-heading">{stats?.pendingRequests || 0}</div>
          </div>
        </div>

        <div className="col-sm-6 col-xl col-6">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small">Accepted</span>
              <div className="stat-icon bg-info bg-opacity-10 text-info" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-check-circle"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold text-info font-heading">{stats?.acceptedDonations || 0}</div>
          </div>
        </div>

        <div className="col-sm-6 col-xl col-6">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small">Picked Up</span>
              <div className="stat-icon bg-purple bg-opacity-10 text-purple" style={{ width: '36px', height: '36px', backgroundColor: '#ede9fe', color: '#6d28d9' }}>
                <i className="bi bi-truck"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold font-heading" style={{ color: '#6d28d9' }}>{stats?.pickedUpDonations || 0}</div>
          </div>
        </div>

        <div className="col-sm-6 col-xl col-12">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small">Completed</span>
              <div className="stat-icon bg-teal bg-opacity-10" style={{ width: '36px', height: '36px', backgroundColor: '#ccfbf1', color: '#0f766e' }}>
                <i className="bi bi-award-fill"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold font-heading" style={{ color: '#0f766e' }}>{stats?.completedDonations || 0}</div>
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="card custom-card p-4 border-0 shadow-sm bg-white">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="font-heading fw-bold mb-0">Recent Requests & Distribution</h5>
          <Link to="/ngo/requests" className="btn btn-sm btn-outline-secondary">
            View All Requests <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>

        {stats?.recentRequests && stats.recentRequests.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-muted">
                  <th>Food Item</th>
                  <th>Quantity</th>
                  <th>Pickup Address</th>
                  <th>Requested Date</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentRequests.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="fw-semibold text-dark">{r.donation?.foodName}</div>
                      <span className="badge bg-light text-muted border">{r.donation?.category?.name}</span>
                    </td>
                    <td className="fw-semibold text-success">{r.donation?.quantity} {r.donation?.quantityUnit}</td>
                    <td className="small text-secondary">
                      <i className="bi bi-geo-alt me-1 text-danger"></i>
                      {r.donation?.pickupAddress}, {r.donation?.city}
                    </td>
                    <td className="small text-muted">
                      {new Date(r.requestedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="text-end">
                      <Link to="/ngo/requests" className="btn btn-sm btn-outline-primary">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5 bg-light rounded-3">
            <i className="bi bi-search display-6 text-muted"></i>
            <h6 className="mt-3 fw-bold font-heading">No food requests submitted yet</h6>
            <p className="text-muted small mb-3">Browse available surplus food and submit a request to collect meals.</p>
            <Link to="/ngo/donations" className="btn btn-primary-custom btn-sm">
              Browse Food Donations
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default NgoDashboard;
