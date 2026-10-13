import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="py-5">
      <div className="container">
        <div className="row align-items-center g-5 mb-5">
          <div className="col-lg-6">
            <span className="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-2 rounded-pill mb-2">
              Our Vision
            </span>
            <h1 className="display-5 fw-bold font-heading mb-3">
              Closing the Gap Between Food Waste & Hunger
            </h1>
            <p className="text-muted lead">
              More than one-third of all food produced globally is wasted, while millions in local communities face severe food insecurity.
            </p>
            <p className="text-muted">
              NourishLink was engineered to transform surplus food from a logistical burden into a lifeline of nutrition.
              By establishing direct digital communication between food-surplus businesses and local charities,
              we ensure surplus items are salvaged quickly, safely, and transparently.
            </p>
            <div className="d-flex gap-3 mt-4">
              <Link to="/register" className="btn btn-primary-custom py-2 px-4">
                Join the Cause
              </Link>
              <Link to="/how-it-works" className="btn btn-secondary-custom py-2 px-4">
                Explore Process
              </Link>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="p-4 p-md-5 rounded-4 bg-white shadow-sm border">
              <h4 className="font-heading fw-bold mb-4 text-dark">Core Platform Principles</h4>

              <div className="d-flex gap-3 mb-4">
                <div className="stat-icon bg-success bg-opacity-10 text-success rounded-3 flex-shrink-0">
                  <i className="bi bi-recycle fs-4"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Ecological Sustainability</h6>
                  <p className="text-muted small mb-0">Preventing organic food matter from rotting in landfills, thereby mitigating harmful methane gas emissions.</p>
                </div>
              </div>

              <div className="d-flex gap-3 mb-4">
                <div className="stat-icon bg-primary bg-opacity-10 text-primary rounded-3 flex-shrink-0">
                  <i className="bi bi-shield-lock-fill fs-4"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Accountable Security</h6>
                  <p className="text-muted small mb-0">Admin gatekeeping and vetting guarantees that only legitimate charitable bodies receive food aid.</p>
                </div>
              </div>

              <div className="d-flex gap-3">
                <div className="stat-icon bg-warning bg-opacity-10 text-warning rounded-3 flex-shrink-0">
                  <i className="bi bi-lightning-charge-fill fs-4"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Time-Sensitive Efficiency</h6>
                  <p className="text-muted small mb-0">Fast coordination with automated expiry checks ensures meals are distributed while completely fresh.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Architecture Overview */}
        <div className="card custom-card p-4 p-md-5 bg-white border">
          <div className="row g-4">
            <div className="col-md-4">
              <h5 className="font-heading fw-bold">Built with Modern Tech</h5>
              <p className="text-muted small mb-0">
                Crafted using Spring Boot 3, React.js, MySQL 8, and secure JWT authentication with strict layered architecture.
              </p>
            </div>
            <div className="col-md-4">
              <h5 className="font-heading fw-bold">Phase 1 Delivery</h5>
              <p className="text-muted small mb-0">
                Focuses on core stability: user authentication, multi-role authorization, donation lifecycle, and administrative oversight.
              </p>
            </div>
            <div className="col-md-4">
              <h5 className="font-heading fw-bold">Open API Standards</h5>
              <p className="text-muted small mb-0">
                Full OpenAPI 3.0 (Swagger) specification integrated for all endpoints with bearer token authorization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
