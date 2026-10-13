import React from 'react';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  return (
    <div className="py-5">
      <div className="container">
        <div className="text-center max-w-700 mx-auto mb-5">
          <span className="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-2 rounded-pill mb-2">
            Seamless Logistics
          </span>
          <h1 className="display-5 fw-bold font-heading">How NourishLink Operates</h1>
          <p className="lead text-muted">
            Our platform provides an intuitive, trustworthy bridge between surplus food suppliers and hunger-relief organizations.
          </p>
        </div>

        {/* Roles Breakdown */}
        <div className="row g-4 mb-5">
          <div className="col-lg-6">
            <div className="card custom-card p-4 p-md-5 h-100 border-0 bg-white shadow-sm">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="stat-icon bg-success text-white rounded-3">
                  <i className="bi bi-heart-fill"></i>
                </div>
                <div>
                  <h3 className="font-heading fw-bold mb-0">For Food Donors</h3>
                  <span className="text-muted small">Hotels, Restaurants, Supermarkets, Caterers</span>
                </div>
              </div>

              <div className="d-flex flex-column gap-3">
                <div className="d-flex gap-3">
                  <div className="fw-bold text-success fs-5">01</div>
                  <div>
                    <h6 className="fw-bold mb-1">List Surplus Food Quickly</h6>
                    <p className="text-muted small mb-0">Enter details such as category, food type (Veg/Non-Veg), quantity, expiry timestamp, and pickup location.</p>
                  </div>
                </div>

                <div className="d-flex gap-3">
                  <div className="fw-bold text-success fs-5">02</div>
                  <div>
                    <h6 className="fw-bold mb-1">Review NGO Requests</h6>
                    <p className="text-muted small mb-0">Only verified and approved NGOs can submit requests. Review who will receive the food and accept with one click.</p>
                  </div>
                </div>

                <div className="d-flex gap-3">
                  <div className="fw-bold text-success fs-5">03</div>
                  <div>
                    <h6 className="fw-bold mb-1">Seamless Pickup & Confirmation</h6>
                    <p className="text-muted small mb-0">The assigned NGO arrives within the designated window. Track status from Available to Picked Up to Completed.</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-top">
                <Link to="/register?role=donor" className="btn btn-outline-primary-custom w-100 justify-content-center py-2">
                  Register as a Donor
                </Link>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card custom-card p-4 p-md-5 h-100 border-0 bg-white shadow-sm">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="stat-icon bg-primary text-white rounded-3">
                  <i className="bi bi-building"></i>
                </div>
                <div>
                  <h3 className="font-heading fw-bold mb-0">For Verified NGOs</h3>
                  <span className="text-muted small">Food Banks, Shelters, Community Kitchens</span>
                </div>
              </div>

              <div className="d-flex flex-column gap-3">
                <div className="d-flex gap-3">
                  <div className="fw-bold text-primary fs-5">01</div>
                  <div>
                    <h6 className="fw-bold mb-1">Register & Get Verified</h6>
                    <p className="text-muted small mb-0">Submit your organization license and contact details. Platform administrators review and approve accounts for safety.</p>
                  </div>
                </div>

                <div className="d-flex gap-3">
                  <div className="fw-bold text-primary fs-5">02</div>
                  <div>
                    <h6 className="fw-bold mb-1">Filter & Request Nearby Food</h6>
                    <p className="text-muted small mb-0">Browse real-time listings filtered by city, dietary preference, and nearest expiry date to request matching quantities.</p>
                  </div>
                </div>

                <div className="d-flex gap-3">
                  <div className="fw-bold text-primary fs-5">03</div>
                  <div>
                    <h6 className="fw-bold mb-1">Pickup and Distribute</h6>
                    <p className="text-muted small mb-0">Collect the food and update status from Accepted to Picked Up, and finally Mark Completed upon distribution.</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-top">
                <Link to="/register?role=ngo" className="btn btn-primary-custom w-100 justify-content-center py-2">
                  Register as an NGO
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 1 Standards */}
        <div className="card custom-card p-4 bg-light border-0">
          <div className="row align-items-center g-3">
            <div className="col-md-8">
              <h5 className="font-heading fw-bold mb-1">Food Safety & Quality Guidelines</h5>
              <p className="text-muted small mb-0">
                All donations must specify accurate preparation dates, safe refrigeration/storage instructions, and an uncompromising expiry timestamp.
              </p>
            </div>
            <div className="col-md-4 text-md-end">
              <span className="badge bg-white text-dark border p-2 fw-semibold">
                <i className="bi bi-shield-check text-success me-1"></i> Strict Verification Protocol
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
