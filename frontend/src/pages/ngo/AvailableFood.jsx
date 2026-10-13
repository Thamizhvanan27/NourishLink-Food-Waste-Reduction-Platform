import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import donationService from '../../services/donationService';
import requestService from '../../services/requestService';
import categoryService from '../../services/categoryService';
import FoodCard from '../../components/FoodCard';
import Pagination from '../../components/Pagination';
import { useAuth } from '../../context/AuthContext';

const AvailableFood = () => {
  const { user, role } = useAuth();

  const [donations, setDonations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFoodType, setSelectedFoodType] = useState('');
  const [city, setCity] = useState('');
  const [keyword, setKeyword] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // Request modal state
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchAvailableDonations();
  }, [page, selectedCategory, selectedFoodType, sortBy]);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getActiveCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAvailableDonations = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 9,
        categoryId: selectedCategory || undefined,
        foodType: selectedFoodType || undefined,
        city: city || undefined,
        keyword: keyword || undefined,
        sortBy
      };

      const res = await donationService.getAvailableDonations(params);
      if (res.success && res.data) {
        setDonations(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      toast.error('Failed to load available donations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchAvailableDonations();
  };

  const handleRequestClick = (donation) => {
    if (!user?.approved) {
      toast.warning('Your NGO is pending admin verification. Unapproved NGOs cannot request food.');
      return;
    }
    setSelectedDonation(donation);
    setRequestMessage('');
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDonation) return;

    try {
      setSubmittingRequest(true);
      const res = await requestService.createRequest({
        donationId: selectedDonation.id,
        message: requestMessage
      });

      if (res.success) {
        toast.success('Food donation request submitted successfully!');
        setSelectedDonation(null);
        fetchAvailableDonations();
      } else {
        toast.error(res.message || 'Request failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit food request';
      toast.error(msg);
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="font-heading fw-bold mb-1">Available Food Donations</h2>
          <p className="text-muted small mb-0">Browse fresh, unexpired food ready for collection and distribution</p>
        </div>
      </div>

      {!user?.approved && (
        <div className="alert alert-warning border-0 p-3 rounded-3 mb-4 d-flex align-items-center gap-2 small">
          <i className="bi bi-info-circle-fill fs-5"></i>
          <span>
            <strong>Note:</strong> Your NGO profile is pending verification. You can browse all available food, but requesting will become active once approved.
          </span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="card custom-card p-4 mb-4 border-0 shadow-sm bg-white">
        <form onSubmit={handleSearchSubmit}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Search Food Item</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="e.g. Rice, Bread, Curry..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-semibold">City</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-geo-alt text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="e.g. Metropolis"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-semibold">Category</label>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(0);
                }}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-semibold">Food Type</label>
              <select
                className="form-select"
                value={selectedFoodType}
                onChange={(e) => {
                  setSelectedFoodType(e.target.value);
                  setPage(0);
                }}
              >
                <option value="">All Types (Veg & Non-Veg)</option>
                <option value="VEGETARIAN">Vegetarian Only</option>
                <option value="NON_VEGETARIAN">Non-Vegetarian</option>
              </select>
            </div>

            <div className="col-12 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center pt-2 gap-3 border-top mt-3">
              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted fw-semibold">Sort By:</span>
                <select
                  className="form-select form-select-sm w-auto"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(0);
                  }}
                >
                  <option value="latest">Latest Listed</option>
                  <option value="expiry">Nearest Expiry (Urgent)</option>
                  <option value="quantity">Highest Quantity</option>
                </select>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary-custom btn-sm px-4">
                  Apply Filters
                </button>
                {(keyword || city || selectedCategory || selectedFoodType || sortBy !== 'latest') && (
                  <button
                    type="button"
                    className="btn btn-secondary-custom btn-sm"
                    onClick={() => {
                      setKeyword('');
                      setCity('');
                      setSelectedCategory('');
                      setSelectedFoodType('');
                      setSortBy('latest');
                      setPage(0);
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Food Listings Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading food items...</span>
          </div>
        </div>
      ) : donations.length > 0 ? (
        <>
          <div className="row g-4 mb-4">
            {donations.map((item) => (
              <div key={item.id} className="col-md-6 col-lg-4">
                <FoodCard
                  donation={item}
                  onRequestClick={handleRequestClick}
                  currentRole={role}
                />
              </div>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </>
      ) : (
        <div className="card custom-card p-5 text-center bg-white border-0 shadow-sm">
          <i className="bi bi-basket display-5 text-muted"></i>
          <h5 className="font-heading fw-bold mt-3">No matching food donations available</h5>
          <p className="text-muted small">
            Check back shortly or reset search filters to find food in other areas.
          </p>
        </div>
      )}

      {/* Request Modal */}
      {selectedDonation && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title font-heading fw-bold">Request Surplus Food</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedDonation(null)}></button>
              </div>
              <form onSubmit={handleRequestSubmit}>
                <div className="modal-body">
                  <div className="p-3 bg-light rounded-3 mb-3">
                    <h6 className="fw-bold mb-1">{selectedDonation.foodName}</h6>
                    <div className="text-success fw-semibold small">
                      Quantity: {selectedDonation.quantity} {selectedDonation.quantityUnit}
                    </div>
                    <div className="text-muted small">
                      <i className="bi bi-geo-alt me-1"></i> {selectedDonation.pickupAddress}, {selectedDonation.city}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Message & Distribution Plan</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="e.g. We will distribute these meals to the local senior community shelter by 3 PM."
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-secondary-custom py-2" onClick={() => setSelectedDonation(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-custom py-2" disabled={submittingRequest}>
                    {submittingRequest ? 'Submitting...' : 'Send Request to Donor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableFood;
