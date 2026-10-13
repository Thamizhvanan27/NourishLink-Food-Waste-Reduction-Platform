import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-top mt-auto pt-5 pb-4">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span style={{ fontSize: '1.75rem' }}>🌱</span>
              <span className="font-heading fs-3 fw-bold" style={{ color: '#065f46' }}>
                Nourish<span style={{ color: '#10b981' }}>Link</span>
              </span>
            </div>
            <p className="text-muted small pe-lg-4">
              A modern digital platform bridging the gap between surplus food generators and grassroots NGOs.
              Together, we eradicate edible food waste and ensure nutritious meals reach those who need it most.
            </p>
            <div className="d-flex gap-3 text-muted">
              <span className="badge bg-light text-success border px-2 py-1">
                <i className="bi bi-shield-check me-1"></i> Phase 1 Core Active
              </span>
            </div>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="font-heading fw-bold mb-3 text-dark">Platform</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              <li><Link to="/" className="text-secondary">Home</Link></li>
              <li><Link to="/how-it-works" className="text-secondary">How It Works</Link></li>
              <li><Link to="/about" className="text-secondary">About Mission</Link></li>
              <li><Link to="/login" className="text-secondary">Sign In</Link></li>
              <li><Link to="/register" className="text-secondary">Join Platform</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6 col-6">
            <h6 className="font-heading fw-bold mb-3 text-dark">User Modules</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              <li><Link to="/login" className="text-secondary">Food Donor Portal</Link></li>
              <li><Link to="/login" className="text-secondary">NGO Food Requests</Link></li>
              <li><Link to="/login" className="text-secondary">Admin Governance</Link></li>
              <li><a href="/swagger-ui.html" target="_blank" rel="noreferrer" className="text-secondary">
                <i className="bi bi-code-slash me-1"></i> Swagger API Docs
              </a></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="font-heading fw-bold mb-3 text-dark">Community Impact</h6>
            <p className="text-muted small mb-3">
              "Turn Surplus Food into Hope" — Help us reach zero food waste in every neighborhood.
            </p>
            <div className="p-3 rounded-3 bg-light border">
              <div className="d-flex align-items-center gap-2 text-dark small fw-semibold">
                <i className="bi bi-envelope-fill text-success"></i> contact@foodwaste.org
              </div>
              <div className="d-flex align-items-center gap-2 text-muted small mt-1">
                <i className="bi bi-geo-alt-fill text-danger"></i> Sustainable City Network
              </div>
            </div>
          </div>
        </div>

        <div className="border-top pt-3 d-flex flex-column flex-md-row justify-content-between align-items-center text-muted small">
          <div>
            &copy; {new Date().getFullYear()} NourishLink — Food Waste Reduction Platform. All rights reserved.
          </div>
          <div className="d-flex gap-3 mt-2 mt-md-0">
            <span className="text-muted">Privacy Policy</span>
            <span>•</span>
            <span className="text-muted">Terms of Service</span>
            <span>•</span>
            <span className="text-muted">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
