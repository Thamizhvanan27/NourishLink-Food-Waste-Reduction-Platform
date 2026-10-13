import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../../services/authService';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Password reset token is missing from the link. Please request a new link.');
      return;
    }

    if (newPassword.length < 6) {
      toast.warning('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.warning('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.resetPassword(token, newPassword);
      setSuccess(true);
      toast.success(res.message || 'Password has been reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Password reset failed or token has expired';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5 bg-light" style={{ minHeight: '80vh' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-8">
            <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5 bg-white">
              <div className="text-center mb-4">
                <div
                  className="rounded-circle bg-success bg-opacity-10 text-success d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: '60px', height: '60px', fontSize: '1.75rem' }}
                >
                  <i className="bi bi-key-fill"></i>
                </div>
                <h3 className="font-heading mb-1 text-dark">Create New Password</h3>
                <p className="text-muted small">
                  Enter and confirm your new secure password below to regain account access.
                </p>
              </div>

              {!token ? (
                <div className="alert alert-danger border-0 rounded-3 p-3 text-center mb-4">
                  <i className="bi bi-exclamation-triangle-fill fs-3 text-danger d-block mb-2"></i>
                  <h6 className="fw-bold mb-1">Invalid Reset Link</h6>
                  <p className="small mb-3 text-muted">
                    No reset token was detected in your URL. Please re-request a reset link.
                  </p>
                  <Link to="/forgot-password" className="btn btn-outline-danger btn-sm">
                    Request New Reset Link
                  </Link>
                </div>
              ) : success ? (
                <div className="alert alert-success border-0 rounded-3 p-3 text-center mb-4">
                  <i className="bi bi-check-circle-fill fs-3 text-success d-block mb-2"></i>
                  <h6 className="fw-bold mb-1">Password Reset Complete!</h6>
                  <p className="small mb-0 text-muted">
                    Redirecting you to the sign-in page in a moment...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">New Password (Min. 6 chars)</label>
                    <input
                      type="password"
                      required
                      className="form-control rounded-3"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-bold text-muted">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      className="form-control rounded-3"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary-custom w-100 justify-content-center py-2 mb-3" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Updating password...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-1"></i> Update Password
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="text-center pt-3 border-top">
                <Link to="/login" className="text-decoration-none small text-success fw-semibold">
                  <i className="bi bi-arrow-left me-1"></i> Return to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
