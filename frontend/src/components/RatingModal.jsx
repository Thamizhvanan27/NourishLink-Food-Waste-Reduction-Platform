import React, { useState } from 'react';
import { toast } from 'react-toastify';
import ratingService from '../services/ratingService';

const RatingModal = ({ donationId, targetRoleName, onClose, onRatingSubmitted }) => {
  const [stars, setStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stars || stars < 1 || stars > 5) {
      toast.warning('Please select a star rating from 1 to 5');
      return;
    }

    try {
      setSubmitting(true);
      await ratingService.createRating({
        donationId,
        rating: stars,
        feedback: feedback.trim()
      });
      toast.success('Thank you! Your rating and feedback have been submitted.');
      if (onRatingSubmitted) onRatingSubmitted();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit rating';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 border-0 shadow">
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="modal-title font-heading">
              <i className="bi bi-star-fill text-warning me-2"></i>
              Rate This Experience
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body text-center py-4">
              <p className="text-muted small mb-3">
                How was your food donation and handover experience with <strong>{targetRoleName || 'the other party'}</strong>?
              </p>

              {/* Interactive 5 Stars (Spec #32) */}
              <div className="d-flex justify-content-center gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="btn p-0 border-0 bg-transparent"
                    style={{ fontSize: '2.25rem', transition: 'transform 0.15s ease' }}
                    onMouseEnter={() => setHoverStars(star)}
                    onMouseLeave={() => setHoverStars(0)}
                    onClick={() => setStars(star)}
                  >
                    <i
                      className={`bi ${
                        star <= (hoverStars || stars)
                          ? 'bi-star-fill text-warning'
                          : 'bi-star text-secondary opacity-25'
                      }`}
                    ></i>
                  </button>
                ))}
              </div>

              <div className="fw-bold text-dark mb-4">
                {stars === 5 && '🌟 Excellent Food Rescue Partnership!'}
                {stars === 4 && '👍 Great Coordination & Punctual'}
                {stars === 3 && '👌 Satisfactory Experience'}
                {stars === 2 && '⚠️ Needs Improvement in Timing/Handling'}
                {stars === 1 && '👎 Unsatisfactory Handover'}
              </div>

              <div className="text-start">
                <label className="form-label small fw-bold text-muted">Feedback (Optional)</label>
                <textarea
                  className="form-control rounded-3"
                  rows="3"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share details on packaging quality, communication, punctuality, or safety..."
                  maxLength="500"
                ></textarea>
                <small className="text-muted text-end d-block mt-1">
                  {feedback.length} / 500 characters
                </small>
              </div>
            </div>

            <div className="modal-footer border-top-0 pt-0">
              <button type="button" className="btn btn-secondary-custom" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary-custom" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send me-1"></i> Submit Rating
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
