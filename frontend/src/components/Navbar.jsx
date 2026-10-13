import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (role === 'ROLE_DONOR') return '/donor/dashboard';
    if (role === 'ROLE_NGO') return '/ngo/dashboard';
    if (role === 'ROLE_ADMIN') return '/admin/dashboard';
    if (role === 'ROLE_VOLUNTEER') return '/volunteer/dashboard';
    return '/';
  };

  const getRoleDisplayName = () => {
    if (role === 'ROLE_DONOR') return 'Food Donor';
    if (role === 'ROLE_NGO') return 'Verified NGO';
    if (role === 'ROLE_ADMIN') return 'Administrator';
    if (role === 'ROLE_VOLUNTEER') return 'Registered Volunteer';
    return '';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top py-3 shadow-sm">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <span style={{ fontSize: '1.75rem' }}>🌱</span>
          <span className="font-heading fs-3 fw-bold" style={{ color: '#065f46', letterSpacing: '-0.5px' }}>
            Nourish<span style={{ color: '#10b981' }}>Link</span>
          </span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-lg-1">
            <li className="nav-item">
              <Link className="nav-link text-dark fw-medium px-3" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-dark fw-medium px-3" to="/how-it-works">How It Works</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-dark fw-medium px-3" to="/about">About Us</Link>
            </li>
            {role === 'ROLE_NGO' && (
              <li className="nav-item">
                <Link className="nav-link fw-semibold px-3 text-success" to="/ngo/donations">
                  <i className="bi bi-box-seam me-1"></i> Browse Available Food
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {isAuthenticated() ? (
              <div className="d-flex align-items-center gap-2">
                <NotificationBell />

                <Link to={getDashboardPath()} className="btn btn-outline-primary-custom py-2 px-3">
                  <i className="bi bi-grid-fill me-1"></i> Dashboard
                </Link>

                <div className="dropdown">
                  <button
                    className="btn btn-secondary-custom dropdown-toggle py-2 px-3 d-flex align-items-center gap-2"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle fs-5 text-success"></i>
                    <div className="text-start d-none d-md-block">
                      <div className="fw-semibold small lh-1">{user?.name}</div>
                      <span className="badge bg-light text-secondary border mt-1" style={{ fontSize: '0.65rem' }}>
                        {getRoleDisplayName()}
                      </span>
                    </div>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2">
                    <li className="px-3 py-2 border-bottom">
                      <p className="mb-0 fw-bold small">{user?.name}</p>
                      <small className="text-muted">{user?.email}</small>
                    </li>
                    <li>
                      <Link className="dropdown-item py-2" to={getDashboardPath()}>
                        <i className="bi bi-speedometer2 me-2 text-primary"></i> Main Dashboard
                      </Link>
                    </li>
                    {role === 'ROLE_DONOR' && (
                      <>
                        <li>
                          <Link className="dropdown-item py-2" to="/donor/donations/create">
                            <i className="bi bi-plus-circle me-2 text-success"></i> Donate Food
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item py-2" to="/donor/requests">
                            <i className="bi bi-inbox me-2 text-warning"></i> Incoming Requests
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item py-2" to="/donor/analytics">
                            <i className="bi bi-graph-up me-2 text-primary"></i> Donor Analytics
                          </Link>
                        </li>
                      </>
                    )}
                    {role === 'ROLE_NGO' && (
                      <>
                        <li>
                          <Link className="dropdown-item py-2" to="/ngo/nearby-food">
                            <i className="bi bi-geo-alt me-2 text-danger"></i> Nearby Food Map
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item py-2" to="/ngo/donations">
                            <i className="bi bi-search me-2 text-success"></i> Available Donations
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item py-2" to="/ngo/requests">
                            <i className="bi bi-clock-history me-2 text-info"></i> Request History
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item py-2" to="/ngo/analytics">
                            <i className="bi bi-graph-up me-2 text-primary"></i> NGO Analytics
                          </Link>
                        </li>
                      </>
                    )}
                    {role === 'ROLE_VOLUNTEER' && (
                      <>
                        <li>
                          <Link className="dropdown-item py-2" to="/volunteer/tasks">
                            <i className="bi bi-bicycle me-2 text-success"></i> Pickup Tasks
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item py-2" to="/volunteer/profile">
                            <i className="bi bi-person-badge me-2 text-info"></i> Volunteer Profile
                          </Link>
                        </li>
                      </>
                    )}
                    {role === 'ROLE_ADMIN' && (
                      <>
                        <li>
                          <Link className="dropdown-item py-2" to="/admin/analytics">
                            <i className="bi bi-graph-up me-2 text-primary"></i> Platform Analytics
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item py-2" to="/admin/reports">
                            <i className="bi bi-file-earmark-bar-graph me-2 text-success"></i> Reports & Export
                          </Link>
                        </li>
                      </>
                    )}
                    <li>
                      <Link className="dropdown-item py-2" to="/notifications">
                        <i className="bi bi-bell me-2 text-warning"></i> Notifications
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item py-2 text-danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i> Log Out
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-secondary-custom py-2 px-3">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary-custom py-2 px-3">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
