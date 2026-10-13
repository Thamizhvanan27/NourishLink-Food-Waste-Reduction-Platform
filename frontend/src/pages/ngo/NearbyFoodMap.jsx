import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { toast } from 'react-toastify';
import donationService from '../../services/donationService';
import categoryService from '../../services/categoryService';
import StatusBadge from '../../components/StatusBadge';

// Fix Leaflet container issues by ensuring standard icon or custom HTML markers
const createCustomIcon = (type = 'donation') => {
  if (type === 'ngo') {
    return L.divIcon({
      className: 'custom-map-marker-ngo',
      html: `
        <div style="
          background: #3b82f6;
          color: white;
          width: 38px;
          height: 38px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4);
          border: 2px solid white;
        ">
          <i class="bi bi-geo-alt-fill" style="transform: rotate(45deg); font-size: 1.1rem;"></i>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38]
    });
  }

  return L.divIcon({
    className: 'custom-map-marker-food',
    html: `
      <div style="
        background: #10b981;
        color: white;
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(16, 185, 129, 0.4);
        border: 2px solid white;
      ">
        <i class="bi bi-box-seam-fill" style="transform: rotate(45deg); font-size: 1rem;"></i>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

const NearbyFoodMap = () => {
  // Default coordinate (Chennai, India from demo data: 13.0827, 80.2707)
  const [coords, setCoords] = useState({ latitude: 13.0827, longitude: 80.2707 });
  const [locationName, setLocationName] = useState('Current Detected Location');
  const [radius, setRadius] = useState(10); // KM
  const [category, setCategory] = useState('');
  const [foodType, setFoodType] = useState('');
  const [categories, setCategories] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [manualCoords, setManualCoords] = useState({ lat: '13.0827', lng: '80.2707', city: 'Chennai' });
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersLayer = useRef(null);
  const radiusCircle = useRef(null);

  // Load categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await categoryService.getAllCategories();
        setCategories(data || []);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCats();
  }, []);

  // Request browser geolocation
  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setCoords(newCoords);
          setManualCoords({
            lat: String(position.coords.latitude),
            lng: String(position.coords.longitude),
            city: 'My GPS Location'
          });
          setLocationName('Live GPS Location');
          setGeoError(null);
          toast.success('Location detected successfully');
        },
        (error) => {
          console.warn('Geolocation denied or failed:', error.message);
          setGeoError('Location permission denied or unavailable. Using default or manual location.');
          toast.info('Using default location. You can manually enter coordinates anytime.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setGeoError('Geolocation is not supported by your browser.');
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstance.current) {
      const map = L.map(mapRef.current).setView([coords.latitude, coords.longitude], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      markersLayer.current = L.layerGroup().addTo(map);
      mapInstance.current = map;
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Fetch nearby donations when coords, radius, category, or foodType change
  const fetchNearby = async () => {
    setLoading(true);
    try {
      const params = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        radius,
        ...(category && { category }),
        ...(foodType && { foodType })
      };
      const data = await donationService.getNearbyDonations(params);
      setDonations(data || []);
    } catch (err) {
      console.error('Failed to fetch nearby donations', err);
      toast.error('Failed to load nearby donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearby();
  }, [coords, radius, category, foodType]);

  // Update map markers whenever donations or coords or radius change
  useEffect(() => {
    if (!mapInstance.current || !markersLayer.current) return;

    markersLayer.current.clearLayers();

    // Pan map to current coords
    mapInstance.current.setView([coords.latitude, coords.longitude]);

    // Draw radius circle
    if (radiusCircle.current) {
      radiusCircle.current.remove();
    }
    radiusCircle.current = L.circle([coords.latitude, coords.longitude], {
      color: '#3b82f6',
      fillColor: '#93c5fd',
      fillOpacity: 0.15,
      radius: radius * 1000 // KM to meters
    }).addTo(mapInstance.current);

    // Add NGO marker
    const ngoMarker = L.marker([coords.latitude, coords.longitude], {
      icon: createCustomIcon('ngo')
    }).bindPopup(`
      <div style="font-family: inherit; font-size: 0.85rem;">
        <div style="font-weight: 700; color: #1e293b; margin-bottom: 2px;">📍 Your Location</div>
        <div style="color: #64748b; font-size: 0.75rem;">Radius: ${radius} KM</div>
      </div>
    `);
    markersLayer.current.addLayer(ngoMarker);

    // Add donation markers
    donations.forEach((donation) => {
      if (donation.latitude != null && donation.longitude != null) {
        const marker = L.marker([donation.latitude, donation.longitude], {
          icon: createCustomIcon('donation')
        });

        const popupContent = `
          <div style="font-family: inherit; min-width: 200px; padding: 4px;">
            <div style="font-weight: 700; color: #065f46; font-size: 0.95rem; margin-bottom: 4px;">
              ${donation.foodName}
            </div>
            <div style="display: flex; gap: 6px; margin-bottom: 6px;">
              <span style="background: #d1fae5; color: #065f46; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">
                ${donation.quantity} ${donation.unit}
              </span>
              <span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">
                ${donation.distanceKm != null ? donation.distanceKm.toFixed(1) + ' KM away' : ''}
              </span>
            </div>
            <div style="color: #475569; font-size: 0.78rem; margin-bottom: 2px;">
              <strong>Category:</strong> ${donation.categoryName || 'General'}
            </div>
            <div style="color: #475569; font-size: 0.78rem; margin-bottom: 2px;">
              <strong>Expires:</strong> ${new Date(donation.expiryTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style="color: #64748b; font-size: 0.75rem; margin-bottom: 8px;">
              <i class="bi bi-geo-alt"></i> ${donation.pickupAddress || 'Address on file'}
            </div>
            <a href="/donations/${donation.id}" style="
              display: block;
              text-align: center;
              background: #10b981;
              color: white;
              padding: 5px 10px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 600;
              font-size: 0.78rem;
            ">
              View Details & Request
            </a>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => setSelectedDonation(donation));
        markersLayer.current.addLayer(marker);
      }
    });
  }, [donations, coords, radius]);

  const handleManualLocationSubmit = (e) => {
    e.preventDefault();
    const lat = parseFloat(manualCoords.lat);
    const lng = parseFloat(manualCoords.lng);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error('Please enter valid coordinates (-90 to 90, -180 to 180)');
      return;
    }

    setCoords({ latitude: lat, longitude: lng });
    setLocationName(manualCoords.city || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    setShowManualModal(false);
    toast.success('Location coordinates updated');
  };

  const centerOnDonation = (donation) => {
    if (mapInstance.current && donation.latitude && donation.longitude) {
      mapInstance.current.setView([donation.latitude, donation.longitude], 14, { animate: true });
      setSelectedDonation(donation);
    }
  };

  return (
    <div className="container-fluid py-4 px-lg-4">
      {/* Title & Location Header */}
      <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-success bg-opacity-10 text-success p-2 rounded-circle">
                <i className="bi bi-geo-alt-fill fs-5"></i>
              </span>
              <h2 className="font-heading mb-0 text-dark">Location-Based Food Discovery</h2>
            </div>
            <p className="text-muted small mb-0">
              Interactive map with live distance calculation using OpenStreetMap & Leaflet. Find food donations within your search radius.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div className="d-flex align-items-center gap-2 bg-light px-3 py-2 rounded-pill border">
              <i className="bi bi-geo text-danger"></i>
              <span className="small fw-semibold text-dark text-truncate" style={{ maxWidth: '180px' }}>
                {locationName}
              </span>
            </div>

            <button className="btn btn-sm btn-outline-primary" onClick={requestLocation} title="Detect My GPS Location">
              <i className="bi bi-crosshair me-1"></i> Detect GPS
            </button>

            <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowManualModal(true)}>
              <i className="bi bi-pencil-square me-1"></i> Set Coordinates
            </button>
          </div>
        </div>

        {geoError && (
          <div className="alert alert-warning alert-dismissible fade show mt-3 mb-0 py-2 small" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {geoError}
            <button type="button" className="btn-close py-2" onClick={() => setGeoError(null)}></button>
          </div>
        )}
      </div>

      {/* Filter Toolbar & Radius Pills */}
      <div className="card shadow-sm border-0 rounded-4 p-3 mb-4">
        <div className="row g-3 align-items-center">
          {/* Radius selection pills (Spec #2: 1 KM, 5 KM, 10 KM, 25 KM, 50 KM) */}
          <div className="col-lg-6 col-md-12">
            <label className="form-label small fw-bold text-muted mb-2">Search Radius:</label>
            <div className="d-flex flex-wrap gap-2">
              {[1, 5, 10, 25, 50].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                    radius === r
                      ? 'btn-success text-white shadow-sm'
                      : 'btn-outline-secondary bg-white'
                  }`}
                  onClick={() => setRadius(r)}
                >
                  <i className="bi bi-broadcast me-1"></i> {r} KM
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="col-lg-3 col-md-6">
            <label className="form-label small fw-bold text-muted mb-1">Food Category:</label>
            <select
              className="form-select form-select-sm rounded-3"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Food Type Filter */}
          <div className="col-lg-3 col-md-6">
            <label className="form-label small fw-bold text-muted mb-1">Food Type:</label>
            <select
              className="form-select form-select-sm rounded-3"
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
            >
              <option value="">All Food Types</option>
              <option value="VEG">Vegetarian</option>
              <option value="NON_VEG">Non-Vegetarian</option>
              <option value="VEGAN">Vegan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Split: Map & Nearby Items List */}
      <div className="row g-4">
        {/* Map View */}
        <div className="col-lg-8 col-12">
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden position-relative">
            <div
              ref={mapRef}
              style={{ height: '620px', width: '100%', zIndex: 1 }}
            />
            {loading && (
              <div
                className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.65)', zIndex: 1000 }}
              >
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Loading donations...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nearby Cards Panel */}
        <div className="col-lg-4 col-12">
          <div className="card shadow-sm border-0 rounded-4 p-3 h-100 d-flex flex-column" style={{ maxHeight: '620px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <div>
                <h5 className="font-heading mb-0 text-dark">Nearby Donations</h5>
                <small className="text-muted">Found {donations.length} items within {radius} KM</small>
              </div>
              <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2">
                Haversine SQL
              </span>
            </div>

            <div className="overflow-auto flex-grow-1 pe-1">
              {donations.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-geo-alt-fill fs-1 text-secondary opacity-50 d-block mb-2"></i>
                  <h6>No donations within {radius} KM</h6>
                  <p className="small text-muted mb-3">Try expanding your search radius to 25 KM or 50 KM.</p>
                  <button className="btn btn-sm btn-outline-success" onClick={() => setRadius(25)}>
                    Expand to 25 KM
                  </button>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {donations.map((item) => (
                    <div
                      key={item.id}
                      className={`card border rounded-3 p-3 transition-all ${
                        selectedDonation?.id === item.id ? 'border-success shadow-sm bg-success bg-opacity-10' : 'hover-shadow'
                      }`}
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onClick={() => centerOnDonation(item)}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="fw-bold text-dark mb-0">{item.foodName}</h6>
                        <span className="badge bg-success text-white rounded-pill px-2 py-1 small">
                          <i className="bi bi-compass me-1"></i>
                          {item.distanceKm != null ? `${item.distanceKm.toFixed(1)} KM` : 'Nearby'}
                        </span>
                      </div>

                      <div className="d-flex align-items-center gap-2 mb-2 text-muted small">
                        <span className="badge bg-light text-secondary border">
                          {item.quantity} {item.unit}
                        </span>
                        <span className="badge bg-light text-secondary border">
                          {item.categoryName || 'General'}
                        </span>
                        {item.foodType && (
                          <span className={`badge ${item.foodType === 'VEG' ? 'bg-success' : 'bg-danger'} text-white`}>
                            {item.foodType}
                          </span>
                        )}
                      </div>

                      <div className="small text-muted mb-2">
                        <i className="bi bi-geo-alt me-1 text-danger"></i>
                        <span className="text-truncate">{item.pickupAddress || item.city || 'Address available'}</span>
                      </div>

                      <div className="small text-muted mb-3">
                        <i className="bi bi-clock me-1 text-warning"></i>
                        <span>Expires: {new Date(item.expiryTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary flex-grow-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            centerOnDonation(item);
                          }}
                        >
                          <i className="bi bi-eye me-1"></i> Pin on Map
                        </button>
                        <Link
                          to={`/donations/${item.id}`}
                          className="btn btn-sm btn-primary-custom flex-grow-1 text-center justify-content-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Request
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Coordinates Modal (Spec #5) */}
      {showManualModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title font-heading">
                  <i className="bi bi-geo-alt-fill text-danger me-2"></i>
                  Set Manual Coordinates
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowManualModal(false)}></button>
              </div>
              <form onSubmit={handleManualLocationSubmit}>
                <div className="modal-body">
                  <p className="text-muted small">
                    If browser geolocation is unavailable or denied, you can manually enter your city or latitude & longitude.
                  </p>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">City Name (Optional)</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      value={manualCoords.city}
                      onChange={(e) => setManualCoords({ ...manualCoords, city: e.target.value })}
                      placeholder="e.g. Chennai, Bangalore, Mumbai"
                    />
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        required
                        className="form-control rounded-3"
                        value={manualCoords.lat}
                        onChange={(e) => setManualCoords({ ...manualCoords, lat: e.target.value })}
                        placeholder="e.g. 13.0827"
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        required
                        className="form-control rounded-3"
                        value={manualCoords.lng}
                        onChange={(e) => setManualCoords({ ...manualCoords, lng: e.target.value })}
                        placeholder="e.g. 80.2707"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-0">
                  <button type="button" className="btn btn-secondary-custom" onClick={() => setShowManualModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-custom">
                    Apply Location
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

export default NearbyFoodMap;
