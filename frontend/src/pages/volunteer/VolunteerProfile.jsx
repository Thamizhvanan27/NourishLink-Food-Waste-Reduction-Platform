import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import volunteerService from '../../services/volunteerService';

const VolunteerProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    availability: 'All days',
    vehicleType: 'BIKE',
    active: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await volunteerService.getProfile();
        if (data) {
          setProfile({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            availability: data.availability || 'All days',
            vehicleType: data.vehicleType || 'BIKE',
            active: data.active !== false
          });
        }
      } catch (err) {
        toast.error('Failed to load volunteer profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await volunteerService.updateProfile(profile);
      toast.success('Volunteer profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center text-muted">
        <div className="spinner-border text-success mb-2" role="status"></div>
        <div>Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5 bg-white">
            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
              <div
                className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center"
                style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}
              >
                <i className="bi bi-bicycle"></i>
              </div>
              <div>
                <h3 className="font-heading mb-1 text-dark">Volunteer Profile</h3>
                <p className="text-muted small mb-0">
                  Manage your vehicle details, active status, contact info, and preferred service areas.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Full Name</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    value={profile.name}
                    disabled
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">Email Address</label>
                  <input
                    type="email"
                    className="form-control rounded-3"
                    value={profile.email}
                    disabled
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    className="form-control rounded-3"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+91 9876543210"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">Vehicle Type *</label>
                  <select
                    className="form-select rounded-3"
                    value={profile.vehicleType}
                    onChange={(e) => setProfile({ ...profile, vehicleType: e.target.value })}
                  >
                    <option value="BIKE">Two-Wheeler / Bike</option>
                    <option value="CAR">Four-Wheeler / Car</option>
                    <option value="VAN">Van / Small Truck</option>
                    <option value="OTHER">Other / Cargo Scooter</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">Operating City *</label>
                  <input
                    type="text"
                    required
                    className="form-control rounded-3"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    placeholder="e.g. Chennai"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">Availability Schedule</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    value={profile.availability}
                    onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
                    placeholder="e.g. Weekends, Evenings, 9 AM - 6 PM"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold">Operating Base Address</label>
                  <textarea
                    rows="2"
                    className="form-control rounded-3"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    placeholder="Street, area, postal code"
                  ></textarea>
                </div>

                <div className="col-12 mt-4 pt-3 border-top">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="activeStatusSwitch"
                      checked={profile.active}
                      onChange={(e) => setProfile({ ...profile, active: e.target.checked })}
                    />
                    <label className="form-check-label fw-bold text-dark" htmlFor="activeStatusSwitch">
                      Available to Receive New Pickup Tasks
                    </label>
                    <div className="text-muted small">
                      Switch off when you are temporarily unavailable or resting.
                    </div>
                  </div>
                </div>

                <div className="col-12 mt-4 text-end">
                  <button type="submit" className="btn btn-primary-custom" disabled={saving}>
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Saving changes...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save me-1"></i> Save Profile
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerProfile;
