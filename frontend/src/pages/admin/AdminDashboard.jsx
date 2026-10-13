import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboard();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      toast.error('Failed to load admin statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading platform analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="font-heading fw-bold mb-1">Platform Governance Overview</h2>
          <p className="text-muted small mb-0">System-wide monitoring of food donors, NGOs, listings, and distribution</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/ngos" className="btn btn-primary-custom py-2 px-3">
            <i className="bi bi-patch-check me-1"></i> Review Pending NGOs
          </Link>
          <a href="/swagger-ui.html" target="_blank" rel="noreferrer" className="btn btn-secondary-custom py-2 px-3">
            <i className="bi bi-file-earmark-code me-1"></i> Swagger Docs
          </a>
        </div>
      </div>

      {/* Metrics Row 1: Users & NGOs */}
      <h5 className="font-heading fw-bold text-dark mb-3">Community & Organizations</h5>
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-2 col-6">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small">Total Users</span>
              <div className="stat-icon bg-light text-dark" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-people-fill"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold font-heading">{stats?.totalUsers || 0}</div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-2 col-6">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small">Food Donors</span>
              <div className="stat-icon bg-success bg-opacity-10 text-success" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-heart-fill"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold text-success font-heading">{stats?.totalDonors || 0}</div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-2 col-6">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small">Total NGOs</span>
              <div className="stat-icon bg-primary bg-opacity-10 text-primary" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-building"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold text-primary font-heading">{stats?.totalNgos || 0}</div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3 col-6">
          <div className="stat-card border-success">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small">Approved NGOs</span>
              <div className="stat-icon bg-success bg-opacity-10 text-success" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-patch-check-fill"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold text-success font-heading">{stats?.approvedNgos || 0}</div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3 col-6">
          <div className="stat-card border-warning">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small">Pending NGO Approvals</span>
              <div className="stat-icon bg-warning bg-opacity-10 text-warning" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-hourglass-split"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold text-warning font-heading">{stats?.pendingNgos || 0}</div>
          </div>
        </div>
      </div>

      {/* Metrics Row 2: Food & Flow */}
      <h5 className="font-heading fw-bold text-dark mb-3">Donations & Logistics Flow</h5>
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-2 col-6">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small">Total Listed</span>
              <div className="stat-icon bg-light text-dark" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-box-seam"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold font-heading">{stats?.totalDonations || 0}</div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-2 col-6">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small">Available Food</span>
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
              <span className="text-muted small">Completed</span>
              <div className="stat-icon" style={{ width: '36px', height: '36px', backgroundColor: '#ccfbf1', color: '#0f766e' }}>
                <i className="bi bi-award-fill"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold font-heading" style={{ color: '#0f766e' }}>{stats?.completedDonations || 0}</div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3 col-6">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small">Expired Listings</span>
              <div className="stat-icon bg-light text-muted" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-clock-history"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold text-muted font-heading">{stats?.expiredDonations || 0}</div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3 col-6">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small">Pending Requests</span>
              <div className="stat-icon bg-warning bg-opacity-10 text-warning" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-inbox-fill"></i>
              </div>
            </div>
            <div className="fs-3 fw-bold text-warning font-heading">{stats?.pendingRequests || 0}</div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="row g-4">
        <div className="col-md-6 col-lg-3">
          <Link to="/admin/users" className="card custom-card p-4 text-decoration-none text-dark h-100">
            <div className="stat-icon bg-primary text-white rounded-3 mb-3">
              <i className="bi bi-person-gear"></i>
            </div>
            <h5 className="font-heading fw-bold mb-1">User Directory</h5>
            <p className="text-muted small mb-0">Browse platform users, check status, block or unblock accounts.</p>
          </Link>
        </div>

        <div className="col-md-6 col-lg-3">
          <Link to="/admin/ngos" className="card custom-card p-4 text-decoration-none text-dark h-100">
            <div className="stat-icon bg-warning text-white rounded-3 mb-3">
              <i className="bi bi-patch-check"></i>
            </div>
            <h5 className="font-heading fw-bold mb-1">NGO Approvals</h5>
            <p className="text-muted small mb-0">Review pending registrations, registration numbers, and issue approvals.</p>
          </Link>
        </div>

        <div className="col-md-6 col-lg-3">
          <Link to="/admin/donations" className="card custom-card p-4 text-decoration-none text-dark h-100">
            <div className="stat-icon bg-success text-white rounded-3 mb-3">
              <i className="bi bi-box-seam"></i>
            </div>
            <h5 className="font-heading fw-bold mb-1">Donation Listings</h5>
            <p className="text-muted small mb-0">Monitor listed items, enforce food safety, and remove violations.</p>
          </Link>
        </div>

        <div className="col-md-6 col-lg-3">
          <Link to="/admin/requests" className="card custom-card p-4 text-decoration-none text-dark h-100">
            <div className="stat-icon bg-info text-white rounded-3 mb-3">
              <i className="bi bi-list-check"></i>
            </div>
            <h5 className="font-heading fw-bold mb-1">Request Audit</h5>
            <p className="text-muted small mb-0">Audit all request flows, acceptance timestamps, and completion rates.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
