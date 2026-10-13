import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardSidebar = () => {
  const { role, user } = useAuth();

  const donorLinks = [
    { to: '/donor/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
    { to: '/donor/donations', label: 'My Donations', icon: 'bi-collection' },
    { to: '/donor/donations/create', label: 'Donate Food', icon: 'bi-plus-circle' },
    { to: '/donor/requests', label: 'Incoming Requests', icon: 'bi-inbox' },
    { to: '/donor/analytics', label: 'Analytics', icon: 'bi-graph-up' },
    { to: '/donor/profile', label: 'Profile & Security', icon: 'bi-person' },
    { to: '/notifications', label: 'Notifications', icon: 'bi-bell' }
  ];

  const ngoLinks = [
    { to: '/ngo/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
    { to: '/ngo/nearby-food', label: 'Nearby Map', icon: 'bi-geo-alt' },
    { to: '/ngo/donations', label: 'Browse Food', icon: 'bi-search' },
    { to: '/ngo/requests', label: 'My Requests', icon: 'bi-clock-history' },
    { to: '/ngo/analytics', label: 'Analytics', icon: 'bi-graph-up' },
    { to: '/ngo/profile', label: 'NGO Profile', icon: 'bi-building' },
    { to: '/notifications', label: 'Notifications', icon: 'bi-bell' }
  ];

  const volunteerLinks = [
    { to: '/volunteer/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
    { to: '/volunteer/tasks', label: 'Pickup Tasks', icon: 'bi-bicycle' },
    { to: '/volunteer/profile', label: 'Volunteer Profile', icon: 'bi-person-badge' },
    { to: '/notifications', label: 'Notifications', icon: 'bi-bell' }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Overview', icon: 'bi-speedometer2' },
    { to: '/admin/analytics', label: 'Platform Analytics', icon: 'bi-graph-up' },
    { to: '/admin/reports', label: 'Reports & Export', icon: 'bi-file-earmark-bar-graph' },
    { to: '/admin/users', label: 'User Directory', icon: 'bi-people' },
    { to: '/admin/ngos', label: 'NGO Approvals', icon: 'bi-patch-check' },
    { to: '/admin/donations', label: 'All Donations', icon: 'bi-box-seam' },
    { to: '/admin/requests', label: 'Platform Requests', icon: 'bi-list-check' },
    { to: '/notifications', label: 'Notifications', icon: 'bi-bell' }
  ];

  let links = [];
  let roleTitle = '';
  if (role === 'ROLE_DONOR') {
    links = donorLinks;
    roleTitle = 'Donor Workspace';
  } else if (role === 'ROLE_NGO') {
    links = ngoLinks;
    roleTitle = 'NGO Operations';
  } else if (role === 'ROLE_VOLUNTEER') {
    links = volunteerLinks;
    roleTitle = 'Volunteer Logistics';
  } else if (role === 'ROLE_ADMIN') {
    links = adminLinks;
    roleTitle = 'Admin Portal';
  }

  return (
    <aside className="dashboard-sidebar d-none d-lg-block">
      <div className="mb-4 px-3">
        <span className="text-uppercase fw-bold text-muted small" style={{ letterSpacing: '0.08em', fontSize: '0.72rem' }}>
          {roleTitle}
        </span>
        <div className="fw-bold text-dark mt-1 text-truncate">{user?.name}</div>
        <div className="text-muted small text-truncate">{user?.email}</div>
      </div>

      <nav className="nav flex-column">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to.endsWith('/dashboard')}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <i className={`bi ${link.icon} fs-5`}></i>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {role === 'ROLE_NGO' && !user?.approved && (
        <div className="mt-4 p-3 rounded-3 bg-warning bg-opacity-10 border border-warning">
          <div className="d-flex gap-2">
            <i className="bi bi-exclamation-triangle-fill text-warning"></i>
            <div>
              <div className="fw-bold small text-dark">Pending Approval</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                Your NGO registration is under admin review. Food requests are enabled once approved.
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default DashboardSidebar;
