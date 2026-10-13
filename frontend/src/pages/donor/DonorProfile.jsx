import React, { useState } from 'react';
import { toast } from 'react-toastify';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const DonorProfile = () => {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.warning('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.warning('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.changePassword({ currentPassword, newPassword });
      if (res.success) {
        toast.success('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res.message || 'Password change failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-800 mx-auto">
      <div className="mb-4">
        <h2 className="font-heading fw-bold mb-1">Donor Profile & Security</h2>
        <p className="text-muted small mb-0">Manage your organization profile and account credentials</p>
      </div>

      <div className="row g-4">
        {/* Profile Card */}
        <div className="col-md-6">
          <div className="card custom-card p-4 bg-white border-0 shadow-sm h-100">
            <h5 className="font-heading fw-bold mb-3">Donor Information</h5>
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="stat-icon bg-success bg-opacity-10 text-success rounded-circle" style={{ width: '56px', height: '56px' }}>
                <i className="bi bi-building fs-3"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-0">{user?.name}</h6>
                <span className="badge bg-light text-success border mt-1">Verified Food Donor</span>
              </div>
            </div>

            <div className="d-flex flex-column gap-3 small text-muted">
              <div>
                <span className="text-dark fw-semibold d-block">Account Email</span>
                {user?.email}
              </div>
              <div>
                <span className="text-dark fw-semibold d-block">Account ID</span>
                #{user?.userId}
              </div>
              <div>
                <span className="text-dark fw-semibold d-block">Account Type</span>
                Food Surplus Partner (Hotel / Restaurant / Caterer)
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="col-md-6">
          <div className="card custom-card p-4 bg-white border-0 shadow-sm h-100">
            <h5 className="font-heading fw-bold mb-3">Change Password</h5>
            <form onSubmit={handlePasswordChange}>
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

              <button
                type="submit"
                className="btn btn-primary-custom w-100 justify-content-center py-2"
                disabled={loading}
              >
                {loading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorProfile;
