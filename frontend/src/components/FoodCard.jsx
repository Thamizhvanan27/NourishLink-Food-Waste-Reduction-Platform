import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const FoodCard = ({ donation, onRequestClick, showActions = true, currentRole = null }) => {
  const defaultImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

  const formatExpiry = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="card custom-card h-100 overflow-hidden d-flex flex-column">
      <div className="position-relative" style={{ height: '180px', overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
        <img
          src={donation.imageUrl || defaultImage}
          alt={donation.foodName}
          className="w-100 h-100"
          style={{ objectFit: 'cover', transition: 'transform 0.3s ease' }}
          onError={(e) => { e.target.src = defaultImage; }}
        />
        <div className="position-absolute top-0 start-0 m-2">
          {donation.foodType === 'VEGETARIAN' ? (
            <span className="veg-badge shadow-sm">
              <i className="bi bi-circle-fill" style={{ fontSize: '0.5rem' }}></i> VEG
            </span>
          ) : (
            <span className="non-veg-badge shadow-sm">
              <i className="bi bi-triangle-fill" style={{ fontSize: '0.5rem' }}></i> NON-VEG
            </span>
          )}
        </div>
        <div className="position-absolute top-0 end-0 m-2">
          <StatusBadge status={donation.status} />
        </div>
        <div className="position-absolute bottom-0 start-0 m-2">
          <span className="badge bg-dark bg-opacity-75 text-white small px-2 py-1 rounded-2">
            <i className="bi bi-tag me-1"></i> {donation.category?.name || 'General'}
          </span>
        </div>
      </div>

      <div className="card-body p-3 d-flex flex-column flex-grow-1">
        <h5 className="font-heading card-title mb-1 text-truncate" title={donation.foodName}>
          {donation.foodName}
        </h5>

        <p className="text-muted small mb-2 line-clamp-2" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.4em'
        }}>
          {donation.description || 'Nutritious surplus food ready for collection and distribution.'}
        </p>

        <div className="d-flex align-items-center justify-content-between p-2 rounded-2 bg-light mb-3">
          <div>
            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Quantity</div>
            <div className="fw-bold text-success fs-6">
              {donation.quantity} {donation.quantityUnit}
            </div>
          </div>
          <div className="text-end">
            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Pickup City</div>
            <div className="fw-semibold text-dark small">
              <i className="bi bi-geo-alt-fill text-danger me-1"></i>
              {donation.city}
            </div>
          </div>
        </div>

        <div className="small text-muted mb-3 mt-auto">
          <div className="d-flex align-items-center justify-content-between">
            <span><i className="bi bi-clock me-1"></i> Expires:</span>
            <span className="fw-semibold text-danger">{formatExpiry(donation.expiryDate)}</span>
          </div>
          {donation.pickupStartTime && (
            <div className="d-flex align-items-center justify-content-between mt-1">
              <span><i className="bi bi-truck me-1"></i> Window:</span>
              <span className="text-dark">{donation.pickupStartTime} - {donation.pickupEndTime}</span>
            </div>
          )}
        </div>

        {showActions && (
          <div className="d-flex gap-2">
            <Link
              to={`/donations/${donation.id}`}
              className="btn btn-secondary-custom flex-grow-1 text-center justify-content-center py-2"
            >
              Details
            </Link>

            {currentRole === 'ROLE_NGO' && donation.status === 'AVAILABLE' && onRequestClick && (
              <button
                type="button"
                className="btn btn-primary-custom flex-grow-1 justify-content-center py-2"
                onClick={() => onRequestClick(donation)}
              >
                Request
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodCard;
