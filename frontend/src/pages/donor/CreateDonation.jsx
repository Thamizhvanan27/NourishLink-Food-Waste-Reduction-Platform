import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import donationService from '../../services/donationService';
import categoryService from '../../services/categoryService';

const CreateDonation = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [foodName, setFoodName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [foodType, setFoodType] = useState('VEGETARIAN');
  const [quantity, setQuantity] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('servings');
  const [preparationDate, setPreparationDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [pickupStartTime, setPickupStartTime] = useState('10:00 AM');
  const [pickupEndTime, setPickupEndTime] = useState('06:00 PM');
  const [pickupAddress, setPickupAddress] = useState('');
  const [city, setCity] = useState('');

  // Image Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getActiveCategories();
      if (res.success && res.data) {
        setCategories(res.data);
        if (res.data.length > 0) {
          setCategoryId(res.data[0].id);
        }
      }
    } catch (err) {
      toast.error('Failed to load categories');
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check extension
    const validExts = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validExts.includes(file.type)) {
      toast.warning('Please select a JPG, JPEG, or PNG image');
      return;
    }

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));

    // Upload immediately
    try {
      setUploadingImage(true);
      const res = await donationService.uploadImage(file);
      if (res.success && res.data) {
        setImageUrl(res.data.imageUrl);
        toast.success('Image uploaded successfully');
      }
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!foodName || !categoryId || !quantity || !expiryDate || !pickupAddress || !city) {
      toast.warning('Please fill in all required fields');
      return;
    }

    if (parseFloat(quantity) <= 0) {
      toast.warning('Quantity must be greater than zero');
      return;
    }

    // Check expiry in future
    const expDateObj = new Date(expiryDate);
    if (expDateObj <= new Date()) {
      toast.warning('Expiry date must be in the future');
      return;
    }

    const payload = {
      foodName,
      description,
      categoryId: parseInt(categoryId),
      foodType,
      quantity: parseFloat(quantity),
      quantityUnit,
      preparationDate: preparationDate || null,
      expiryDate: expDateObj.toISOString(),
      pickupStartTime,
      pickupEndTime,
      pickupAddress,
      city,
      imageUrl: imageUrl || null
    };

    try {
      setLoading(true);
      const res = await donationService.createDonation(payload);
      if (res.success) {
        toast.success('Food donation created successfully.');
        navigate('/donor/donations');
      } else {
        toast.error(res.message || 'Failed to create donation');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error creating donation';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-900 mx-auto">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="font-heading fw-bold mb-1">List Surplus Food Donation</h2>
          <p className="text-muted small mb-0">Fill out details so nearby NGOs can request and rescue this food</p>
        </div>
      </div>

      <div className="card custom-card p-4 p-md-5 bg-white border-0 shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* Food Name & Category */}
            <div className="col-md-8">
              <label className="form-label fw-semibold small">Food Title / Item Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 50 Trays of Mixed Veg Fried Rice & Dal"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold small">Category *</label>
              <select
                className="form-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Food Type & Quantities */}
            <div className="col-md-4">
              <label className="form-label fw-semibold small">Food Type *</label>
              <div className="d-flex gap-3 mt-1">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="foodType"
                    id="typeVeg"
                    value="VEGETARIAN"
                    checked={foodType === 'VEGETARIAN'}
                    onChange={() => setFoodType('VEGETARIAN')}
                  />
                  <label className="form-check-label fw-semibold text-success small" htmlFor="typeVeg">
                    Vegetarian
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="foodType"
                    id="typeNonVeg"
                    value="NON_VEGETARIAN"
                    checked={foodType === 'NON_VEGETARIAN'}
                    onChange={() => setFoodType('NON_VEGETARIAN')}
                  />
                  <label className="form-check-label fw-semibold text-danger small" htmlFor="typeNonVeg">
                    Non-Veg
                  </label>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold small">Quantity *</label>
              <input
                type="number"
                step="0.5"
                min="0.1"
                className="form-control"
                placeholder="e.g. 25"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold small">Quantity Unit *</label>
              <select
                className="form-select"
                value={quantityUnit}
                onChange={(e) => setQuantityUnit(e.target.value)}
              >
                <option value="servings">servings / meals</option>
                <option value="kg">kg (Kilograms)</option>
                <option value="packets">packets / boxes</option>
                <option value="liters">liters</option>
                <option value="portions">portions</option>
              </select>
            </div>

            {/* Dates */}
            <div className="col-md-6">
              <label className="form-label fw-semibold small">Preparation Date</label>
              <input
                type="date"
                className="form-control"
                value={preparationDate}
                onChange={(e) => setPreparationDate(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold small">Expiration Date & Time *</label>
              <input
                type="datetime-local"
                className="form-control"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>Donation will automatically expire after this time.</span>
            </div>

            {/* Pickup Windows */}
            <div className="col-md-6">
              <label className="form-label fw-semibold small">Pickup Start Time</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 10:00 AM"
                value={pickupStartTime}
                onChange={(e) => setPickupStartTime(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold small">Pickup End Time</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 05:00 PM"
                value={pickupEndTime}
                onChange={(e) => setPickupEndTime(e.target.value)}
              />
            </div>

            {/* Pickup Location */}
            <div className="col-md-8">
              <label className="form-label fw-semibold small">Pickup Street Address *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 100 Grand Banquet Hall, Loading Gate 2"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold small">City *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Metropolis"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="col-12">
              <label className="form-label fw-semibold small">Detailed Description & Handling Notes</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Add allergen notes, temperature storage (e.g. keep refrigerated), packaging details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            {/* Image Upload */}
            <div className="col-12">
              <label className="form-label fw-semibold small">Food Image (JPG, JPEG, PNG)</label>
              <div className="d-flex flex-column flex-sm-row gap-3 align-items-start">
                <div className="flex-grow-1">
                  <input
                    type="file"
                    className="form-control"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleImageChange}
                  />
                  <div className="text-muted small mt-1">Upload a clear photo to help NGOs recognize the food packaging.</div>
                </div>

                {uploadingImage && (
                  <div className="spinner-border spinner-border-sm text-success" role="status">
                    <span className="visually-hidden">Uploading image...</span>
                  </div>
                )}

                {imagePreview && (
                  <div className="rounded-3 overflow-hidden border shadow-sm" style={{ width: '100px', height: '80px' }}>
                    <img src={imagePreview} alt="Preview" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="d-flex gap-3 justify-content-end mt-5 pt-3 border-top">
            <button
              type="button"
              className="btn btn-secondary-custom px-4"
              onClick={() => navigate('/donor/donations')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary-custom px-5 py-2"
              disabled={loading || uploadingImage}
            >
              {loading ? 'Submitting Donation...' : 'Publish Food Donation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDonation;
