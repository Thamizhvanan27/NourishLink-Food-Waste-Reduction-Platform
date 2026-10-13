import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import donationService from '../../services/donationService';
import FoodCard from '../../components/FoodCard';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
  const { isAuthenticated, role } = useAuth();
  const [featuredDonations, setFeaturedDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    try {
      setLoading(true);
      const res = await donationService.getAvailableDonations({ page: 0, size: 3 });
      if (res.success && res.data) {
        setFeaturedDonations(res.data.content || []);
      }
    } catch (err) {
      console.error('Error fetching featured donations', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient text-white py-5 py-md-6" style={{ minHeight: '520px', display: 'flex', alignItems: 'center' }}>
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row align-items-center g-5">
            <div className="col-lg-7 text-center text-lg-start">
              <span className="badge bg-white text-success fw-bold px-3 py-2 rounded-pill mb-3 shadow-sm">
                🌱 Real-time Food Waste Reduction & Rescue
              </span>
              <h1 className="display-4 fw-extrabold font-heading mb-3" style={{ lineHeight: 1.15 }}>
                Turn Surplus Food <br className="d-none d-md-inline" />
                <span style={{ color: '#6ee7b7' }}>into Hope.</span>
              </h1>
              <p className="lead text-light opacity-90 mb-4 pe-lg-4" style={{ fontSize: '1.2rem' }}>
                Connect surplus food from restaurants, event caterers, and grocery suppliers
                directly with verified NGOs fighting local hunger.
              </p>
              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                <Link
                  to={isAuthenticated() && role === 'ROLE_DONOR' ? '/donor/donations/create' : '/register?role=donor'}
                  className="btn btn-light text-success fw-bold py-3 px-4 rounded-3 shadow-lg fs-6"
                >
                  <i className="bi bi-heart-fill text-danger me-2"></i> Donate Surplus Food
                </Link>
                <Link
                  to={isAuthenticated() && role === 'ROLE_NGO' ? '/ngo/donations' : '/register?role=ngo'}
                  className="btn btn-outline-light fw-bold py-3 px-4 rounded-3 fs-6"
                >
                  <i className="bi bi-search me-2"></i> Find Food for NGOs
                </Link>
              </div>

              <div className="mt-4 pt-3 border-top border-light border-opacity-25 d-flex gap-4 justify-content-center justify-content-lg-start text-light small">
                <div><i className="bi bi-shield-check text-warning me-1"></i> Verified NGOs</div>
                <div><i className="bi bi-stopwatch text-warning me-1"></i> Real-time Coordination</div>
                <div><i className="bi bi-check-circle text-warning me-1"></i> Zero Waste Target</div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="glass-card p-4 rounded-4 shadow-lg text-dark">
                <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
                  <div>
                    <h5 className="font-heading fw-bold mb-0">Platform Impact</h5>
                    <span className="text-muted small">Live Redistribution Metrics</span>
                  </div>
                  <span className="badge bg-success bg-opacity-10 text-success fw-bold px-2 py-1 rounded-pill">
                    ● Active System
                  </span>
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <div className="p-3 rounded-3 bg-light border">
                      <div className="fs-3 fw-bold text-success font-heading">100%</div>
                      <div className="small text-muted">Free & Non-Profit</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded-3 bg-light border">
                      <div className="fs-3 fw-bold text-success font-heading">0%</div>
                      <div className="small text-muted">Food Landfill Goal</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded-3 bg-light border">
                      <div className="fs-3 fw-bold text-primary font-heading">3 Roles</div>
                      <div className="small text-muted">Donor, NGO, Admin</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded-3 bg-light border">
                      <div className="fs-3 fw-bold text-warning font-heading">24/7</div>
                      <div className="small text-muted">Rescue Coordination</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-3 rounded-3 bg-success bg-opacity-10 border border-success border-opacity-25">
                  <p className="small text-success mb-0 fw-semibold">
                    <i className="bi bi-info-circle-fill me-1"></i>
                    Every donation created on NourishLink goes straight into hands that need it, avoiding decomposition greenhouse gases.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-2 rounded-pill mb-2">
              Simple 4-Step Process
            </span>
            <h2 className="display-6 fw-bold font-heading">How NourishLink Works</h2>
            <p className="text-muted max-w-600 mx-auto">
              A transparent, accountable workflow that connects surplus food generators with grassroots food distributors.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="card custom-card h-100 p-4 text-center border-0 bg-light">
                <div className="stat-icon bg-success text-white mx-auto mb-3 shadow-sm rounded-circle" style={{ width: '60px', height: '60px' }}>
                  <i className="bi bi-box2-heart fs-4"></i>
                </div>
                <div className="badge bg-white text-success border px-2 py-1 mb-2 fw-bold">Step 1</div>
                <h5 className="font-heading fw-bold">1. Donate</h5>
                <p className="text-muted small mb-0">
                  Donors list surplus food details: quantity, category, photos, pickup times, and expiration deadlines.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card custom-card h-100 p-4 text-center border-0 bg-light">
                <div className="stat-icon bg-warning text-white mx-auto mb-3 shadow-sm rounded-circle" style={{ width: '60px', height: '60px' }}>
                  <i className="bi bi-hand-index-thumb fs-4"></i>
                </div>
                <div className="badge bg-white text-warning border px-2 py-1 mb-2 fw-bold">Step 2</div>
                <h5 className="font-heading fw-bold">2. Request</h5>
                <p className="text-muted small mb-0">
                  Approved NGOs browse available food in their city and submit distribution requests instantly.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card custom-card h-100 p-4 text-center border-0 bg-light">
                <div className="stat-icon bg-primary text-white mx-auto mb-3 shadow-sm rounded-circle" style={{ width: '60px', height: '60px' }}>
                  <i className="bi bi-truck fs-4"></i>
                </div>
                <div className="badge bg-white text-primary border px-2 py-1 mb-2 fw-bold">Step 3</div>
                <h5 className="font-heading fw-bold">3. Collect</h5>
                <p className="text-muted small mb-0">
                  Donor accepts the NGO request, and the NGO visits the pickup address within the safe pickup window.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card custom-card h-100 p-4 text-center border-0 bg-light">
                <div className="stat-icon bg-info text-white mx-auto mb-3 shadow-sm rounded-circle" style={{ width: '60px', height: '60px' }}>
                  <i className="bi bi-people-fill fs-4"></i>
                </div>
                <div className="badge bg-white text-info border px-2 py-1 mb-2 fw-bold">Step 4</div>
                <h5 className="font-heading fw-bold">4. Distribute</h5>
                <p className="text-muted small mb-0">
                  NGO safely distributes wholesome food to community members, elderly shelters, and orphanages.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Available Food */}
      <section className="py-5 bg-light border-top">
        <div className="container py-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
            <div>
              <span className="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-2 rounded-pill mb-2">
                Available Right Now
              </span>
              <h2 className="display-6 fw-bold font-heading mb-0">Surplus Food Ready for Rescue</h2>
            </div>
            <Link to="/register?role=ngo" className="btn btn-outline-primary-custom mt-3 mt-md-0">
              Browse All Food <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : featuredDonations.length > 0 ? (
            <div className="row g-4">
              {featuredDonations.map((item) => (
                <div key={item.id} className="col-md-6 col-lg-4">
                  <FoodCard donation={item} showActions={true} />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 text-center bg-white rounded-4 border">
              <i className="bi bi-basket3 text-muted display-4"></i>
              <h5 className="mt-3 font-heading fw-bold">No active donations right now</h5>
              <p className="text-muted small mb-3">Be the first to list surplus food and prevent waste!</p>
              <Link to="/register?role=donor" className="btn btn-primary-custom">
                List Surplus Food
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Call to action */}
      <section className="py-5 text-white bg-dark">
        <div className="container py-4 text-center">
          <h2 className="display-6 fw-bold font-heading mb-3">Ready to make an impact?</h2>
          <p className="lead text-muted mx-auto mb-4" style={{ maxWidth: '650px' }}>
            Whether you are a caterer with leftover meals or an NGO striving to feed communities,
            NourishLink makes food redistribution effortless and reliable.
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/register" className="btn btn-primary-custom py-3 px-4 fs-6">
              Create an Account Now
            </Link>
            <Link to="/how-it-works" className="btn btn-secondary-custom py-3 px-4 fs-6">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
