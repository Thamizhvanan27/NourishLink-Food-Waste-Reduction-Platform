import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.warning('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.forgotPassword(email);
      setSubmitted(true);
      toast.success(res.message || 'If an account exists, a password reset link has been dispatched to your email.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send password reset email';
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
                  <i className="bi bi-shield-lock-fill"></i>
                </div>
                <h3 className="font-heading mb-1 text-dark">Forgot Password?</h3>
                <p className="text-muted small">
                  Enter your registered account email address. We will generate a secure reset link and email it to you.
                </p>
              </div>

              {submitted ? (
                <div className="alert alert-success border-0 rounded-3 p-3 text-center mb-4">
                  <i className="bi bi-envelope-check-fill fs-3 text-success d-block mb-2"></i>
                  <h6 className="fw-bold mb-1">Check Your Email</h6>
                  <p className="small mb-0 text-muted">
                    We sent password reset instructions to <strong>{email}</strong>. Follow the link to choose a new password.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label small fw-bold text-muted">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-envelope text-muted"></i>
                      </span>
                      <input
                        type="email"
                        required
                        className="form-control rounded-end-3 border-start-0 ps-0"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary-custom w-100 justify-content-center py-2 mb-3" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Sending link...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-1"></i> Send Password Reset Link
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="text-center pt-3 border-top">
                <Link to="/login" className="text-decoration-none small text-success fw-semibold">
                  <i className="bi bi-arrow-left me-1"></i> Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
