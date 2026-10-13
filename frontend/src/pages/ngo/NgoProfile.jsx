import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ngoService from '../../services/ngoService';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const NgoProfile = () => {
  const { updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [ngoName, setNgoName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await ngoService.getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        setNgoName(res.data.ngoName || '');
        setContactPerson(res.data.contactPerson || '');
        setPhone(res.data.phone || '');
        setAddress(res.data.address || '');
        setCity(res.data.city || '');
        setDescription(res.data.description || '');
      }
    } catch (err) {
      toast.error('Failed to load NGO profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await ngoService.updateProfile({
        ngoName,
        contactPerson,
        phone,
        address,
        city,
        description
      });
      if (res.success) {
        toast.success('NGO profile updated successfully');
        setProfile(res.data);
        updateUser({ name: res.data.ngoName });
      } else {
        toast.error(res.message || 'Update failed');
      }
    } catch (err) {
      toast.error('Error updating NGO profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.warning('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.warning('Passwords do not match');
      return;
    }
    try {
      setPasswordLoading(true);
      const res = await authService.changePassword({ currentPassword, newPassword });
      if (res.success) {
        toast.success('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res.message || 'Password update failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error changing password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-900 mx-auto">
      <div className="mb-4">
        <h2 className="font-heading fw-bold mb-1">NGO Profile & Settings</h2>
        <p className="text-muted small mb-0">Manage organization credentials, verification status, and contact details</p>
      </div>

      {/* Verification Status Card */}
      <div className="card custom-card p-4 border-0 shadow-sm bg-white mb-4">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className={`stat-icon rounded-circle ${profile?.approved ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'}`} style={{ width: '56px', height: '56px' }}>
              <i className={`bi ${profile?.approved ? 'bi-patch-check-fill' : 'bi-hourglass-split'} fs-3`}></i>
            </div>
            <div>
              <div className="fw-bold fs-5 font-heading text-dark">{profile?.ngoName}</div>
              <div className="text-muted small">Registration: <span className="fw-semibold text-dark">{profile?.registrationNumber}</span></div>
            </div>
          </div>

          <div>
            {profile?.approved ? (
              <span className="badge bg-success text-white px-3 py-2 rounded-pill fw-semibold">
                <i className="bi bi-check-circle-fill me-1"></i> Verified Partner
              </span>
            ) : (
              <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-semibold">
                <i className="bi bi-clock-history me-1"></i> Under Review
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Profile Edit Form */}
        <div className="col-lg-7">
          <div className="card custom-card p-4 bg-white border-0 shadow-sm">
            <h5 className="font-heading fw-bold mb-3">Organization Details</h5>
            <form onSubmit={handleProfileSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold small">NGO Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={ngoName}
                  onChange={(e) => setNgoName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Registration / License Number</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={profile?.registrationNumber || ''}
                  disabled
                />
                <span className="text-muted" style={{ fontSize: '0.72rem' }}>Registration number is verified by Admin and cannot be edited.</span>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Primary Contact Person</label>
                <input
                  type="text"
                  className="form-control"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  required
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold small">Mission / Operating Areas</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary-custom w-100 justify-content-center py-2" disabled={saving}>
                {saving ? 'Saving...' : 'Save Organization Profile'}
              </button>
            </form>
          </div>
        </div>

        {/* Password Change Form */}
        <div className="col-lg-5">
          <div className="card custom-card p-4 bg-white border-0 shadow-sm">
            <h5 className="font-heading fw-bold mb-3">Change Password</h5>
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">New Password (Min. 6 chars)</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold small">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-secondary-custom w-100 justify-content-center py-2" disabled={passwordLoading}>
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NgoProfile;
