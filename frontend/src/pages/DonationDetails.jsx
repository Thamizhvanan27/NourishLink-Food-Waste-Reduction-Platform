import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import donationService from '../services/donationService';
import requestService from '../services/requestService';
import ratingService from '../services/ratingService';
import StatusBadge from '../components/StatusBadge';
import RatingModal from '../components/RatingModal';
import { useAuth } from '../context/AuthContext';

const DonationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role, isAuthenticated } = useAuth();

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    fetchDonation();
  }, [id]);

  const fetchDonation = async () => {
    try {
      setLoading(true);
      const res = await donationService.getDonationById(id);
      if (res.success && res.data) {
        setDonation(res.data);
        loadRatings(res.data.id);
      } else {
        toast.error('Donation not found');
        navigate('/');
      }
    } catch (err) {
      toast.error('Failed to load donation details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadRatings = async (donationId) => {
    try {
      const data = await ratingService.getDonationRatings(donationId);
      setRatings(data || []);
    } catch (e) {
      console.warn('Could not load ratings', e);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingRequest(true);
      const res = await requestService.createRequest({
        donationId: donation.id,
        message: requestMessage
      });
      if (res.success) {
        toast.success('Food donation request submitted successfully!');
        setShowRequestModal(false);
        fetchDonation();
      } else {
        toast.error(res.message || 'Request failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error submitting request';
      toast.error(msg);
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleDeleteDonation = async () => {
    try {
      await donationService.deleteDonation(donation.id);
      toast.success('Donation deleted successfully');
      navigate(role === 'ROLE_ADMIN' ? '/admin/donations' : '/donor/donations');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error deleting donation';
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!donation) return null;

  const isOwner = user && donation.donor && donation.donor.id === user.userId;
  const isAdmin = role === 'ROLE_ADMIN';
  const isNgo = role === 'ROLE_NGO';
  const defaultImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

  return (
    <div className="py-5 bg-light">
      <div className="container">
        <div className="mb-4">
          <button onClick={() => navigate(-1)} className="btn btn-sm btn-outline-secondary">
            <i className="bi bi-arrow-left me-1"></i> Back
          </button>
        </div>

        <div className="row g-4">
          {/* Main Info */}
          <div className="col-lg-8">
            <div className="card custom-card p-4 p-md-5 bg-white border-0 shadow-sm mb-4">
              <div className="position-relative mb-4 rounded-4 overflow-hidden" style={{ maxHeight: '400px', backgroundColor: '#e2e8f0' }}>
                <img
                  src={donation.imageUrl || defaultImage}
                  alt={donation.foodName}
                  className="w-100 h-100"
                  style={{ objectFit: 'cover', minHeight: '300px' }}
                  onError={(e) => { e.target.src = defaultImage; }}
                />
                <div className="position-absolute top-0 end-0 m-3">
                  <StatusBadge status={donation.status} />
                </div>
              </div>

              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                <span className="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-2 rounded-pill">
                  <i className="bi bi-tag-fill me-1"></i> {donation.category?.name || 'General Category'}
                </span>
                {donation.foodType === 'VEGETARIAN' ? (
                  <span className="veg-badge">
                    <i className="bi bi-circle-fill" style={{ fontSize: '0.5rem' }}></i> VEGETARIAN
                  </span>
                ) : (
                  <span className="non-veg-badge">
                    <i className="bi bi-triangle-fill" style={{ fontSize: '0.5rem' }}></i> NON-VEGETARIAN
                  </span>
                )}
              </div>

              <h1 className="font-heading display-6 fw-bold mb-3">{donation.foodName}</h1>

              <div className="mb-4">
                <h6 className="fw-bold text-muted text-uppercase small" style={{ letterSpacing: '0.05em' }}>Description</h6>
                <p className="text-secondary mb-0" style={{ whiteSpace: 'pre-line' }}>
                  {donation.description || 'No detailed description provided.'}
                </p>
              </div>

              <div className="row g-3 p-3 bg-light rounded-3 mb-4">
                <div className="col-sm-6 col-md-3">
                  <div className="text-muted small">Quantity</div>
                  <div className="fw-bold text-success fs-5">{donation.quantity} {donation.quantityUnit}</div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="text-muted small">City</div>
                  <div className="fw-semibold text-dark">{donation.city}</div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="text-muted small">Preparation Date</div>
                  <div className="fw-semibold text-dark">{donation.preparationDate || 'Not specified'}</div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="text-muted small">Expiry Date</div>
                  <div className="fw-semibold text-danger">
                    {new Date(donation.expiryDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <div className="border-top pt-4">
                <h5 className="font-heading fw-bold mb-3">Pickup Information</h5>
                <div className="d-flex flex-column gap-2 text-secondary small">
                  <div>
                    <strong className="text-dark">Pickup Address:</strong> {donation.pickupAddress}, {donation.city}
                  </div>
                  {(donation.pickupStartTime || donation.pickupEndTime) && (
                    <div>
                      <strong className="text-dark">Pickup Hours:</strong> {donation.pickupStartTime || 'Anytime'} - {donation.pickupEndTime || 'Anytime'}
                    </div>
                  )}
                  <div>
                    <strong className="text-dark">Status:</strong> <StatusBadge status={donation.status} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="col-lg-4">
            {/* Donor Details Card */}
            <div className="card custom-card p-4 bg-white border-0 shadow-sm mb-4">
              <h5 className="font-heading fw-bold mb-3">Donor Details</h5>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="stat-icon bg-success bg-opacity-10 text-success rounded-circle">
                  <i className="bi bi-person-fill fs-4"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-0">{donation.donor?.fullName || 'Anonymous Donor'}</h6>
                  <span className="text-muted small">{donation.donor?.city || 'Local area'}</span>
                </div>
              </div>
              <div className="small text-muted border-top pt-3">
                <div><i className="bi bi-envelope me-2"></i> {donation.donor?.email}</div>
                {donation.donor?.phone && (
                  <div className="mt-1"><i className="bi bi-telephone me-2"></i> {donation.donor?.phone}</div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="card custom-card p-4 bg-white border-0 shadow-sm">
              <h5 className="font-heading fw-bold mb-3">Actions</h5>

              {/* Owner actions */}
              {(isOwner || isAdmin) && (
                <div className="d-flex flex-column gap-2 mb-3">
                  {donation.status !== 'COMPLETED' && isOwner && (
                    <Link to={`/donor/donations`} className="btn btn-outline-primary-custom justify-content-center py-2">
                      <i className="bi bi-pencil-square me-1"></i> Manage in Dashboard
                    </Link>
                  )}
                  <button
                    className="btn btn-outline-danger justify-content-center py-2"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <i className="bi bi-trash me-1"></i> Delete Donation
                  </button>
                </div>
              )}

              {/* NGO Request Action */}
              {isNgo && donation.status === 'AVAILABLE' && (
                <div>
                  {user?.approved ? (
                    <button
                      className="btn btn-primary-custom w-100 justify-content-center py-3"
                      onClick={() => setShowRequestModal(true)}
                    >
                      <i className="bi bi-hand-index-thumb me-1"></i> Request This Food
                    </button>
                  ) : (
                    <div className="alert alert-warning small mb-0">
                      <i className="bi bi-exclamation-triangle-fill me-1"></i>
                      Your NGO is pending approval. You will be able to request food once approved by an admin.
                    </div>
                  )}
                </div>
              )}

              {!isAuthenticated() && donation.status === 'AVAILABLE' && (
                <div className="text-center">
                  <p className="small text-muted mb-3">Are you a registered NGO? Sign in to request this food.</p>
                  <Link to="/login" className="btn btn-primary-custom w-100 justify-content-center py-2">
                    Sign In to Request
                  </Link>
                </div>
              )}

              {donation.status !== 'AVAILABLE' && !isOwner && !isAdmin && (
                <div className="alert alert-secondary small mb-0 text-center">
                  This donation is currently <strong>{donation.status}</strong>.
                </div>
              )}

              {/* Phase 2: Completed Donation Rating & Feedback */}
              {donation.status === 'COMPLETED' && isAuthenticated() && (
                <div className="mt-4 pt-3 border-top">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="fw-bold small text-dark">
                      <i className="bi bi-star-fill text-warning me-1"></i> Partner Experience Rating
                    </span>
                    <button
                      className="btn btn-sm btn-outline-warning text-dark fw-semibold"
                      onClick={() => setShowRatingModal(true)}
                    >
                      Rate Experience
                    </button>
                  </div>
                </div>
              )}

              {/* Reviews List */}
              {ratings.length > 0 && (
                <div className="mt-3 pt-3 border-top">
                  <h6 className="fw-bold small text-dark mb-2">Partner Reviews ({ratings.length})</h6>
                  <div className="d-flex flex-column gap-2">
                    {ratings.map((r) => (
                      <div key={r.id} className="p-2 bg-light rounded-3 small">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-semibold text-dark">{r.reviewerName || 'Partner'}</span>
                          <span className="text-warning">
                            {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                          </span>
                        </div>
                        {r.feedback && <p className="mb-0 text-muted small">{r.feedback}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Request Food Modal */}
      {showRequestModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title font-heading fw-bold">Request Food Donation</h5>
                <button type="button" className="btn-close" onClick={() => setShowRequestModal(false)}></button>
              </div>
              <form onSubmit={handleRequestSubmit}>
                <div className="modal-body">
                  <p className="text-muted small">
                    You are requesting <strong>{donation.quantity} {donation.quantityUnit}</strong> of <strong>{donation.foodName}</strong>.
                  </p>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Message to Donor (Optional)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Explain how your NGO will distribute this food and approximate pickup time..."
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-secondary-custom py-2" onClick={() => setShowRequestModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-custom py-2" disabled={submittingRequest}>
                    {submittingRequest ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title font-heading fw-bold text-danger">Confirm Deletion</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <p className="text-muted mb-0">
                  Are you sure you want to delete <strong>{donation.foodName}</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-secondary-custom py-2" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger py-2" onClick={handleDeleteDonation}>
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating & Feedback Modal */}
      {showRatingModal && (
        <RatingModal
          donationId={donation.id}
          targetRoleName={isOwner ? 'Requesting NGO' : donation.donor?.fullName || 'Food Donor'}
          onClose={() => setShowRatingModal(false)}
          onRatingSubmitted={() => loadRatings(donation.id)}
        />
      )}
    </div>
  );
};

export default DonationDetails;
