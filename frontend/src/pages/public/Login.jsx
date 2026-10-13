import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.login({ email, password });
      if (res.success && res.data) {
        login(res.data);
        toast.success(`Welcome back, ${res.data.name}!`);

        if (from) {
          navigate(from, { replace: true });
        } else {
          // Direct by role
          if (res.data.role === 'ROLE_DONOR') navigate('/donor/dashboard');
          else if (res.data.role === 'ROLE_NGO') navigate('/ngo/dashboard');
          else if (res.data.role === 'ROLE_ADMIN') navigate('/admin/dashboard');
          else navigate('/');
        }
      } else {
        toast.error(res.message || 'Login failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials or server error';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="py-5" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-8">
            <div className="card custom-card p-4 p-md-5 border-0 shadow-lg">
              <div className="text-center mb-4">
                <span style={{ fontSize: '2.5rem' }}>🌱</span>
                <h3 className="font-heading fw-bold mt-2">Welcome Back</h3>
                <p className="text-muted small">Sign in to your NourishLink account</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-envelope text-muted"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control border-start-0"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label fw-semibold small mb-0">Password</label>
                    <Link to="/forgot-password" className="text-decoration-none small text-success fw-medium">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-lock text-muted"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control border-start-0"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary-custom w-100 py-3 justify-content-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Signing In...
                    </>
                  ) : (
                    'Sign In to Platform'
                  )}
                </button>
              </form>

              {/* Quick Demo Credentials for Convenience */}
              <div className="mt-4 pt-3 border-top">
                <div className="text-muted small text-center mb-2 fw-semibold">Quick-fill Demo Accounts:</div>
                <div className="d-flex gap-2 justify-content-center flex-wrap">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-success"
                    onClick={() => handleQuickLogin('donor@demo.com', 'donor123')}
                  >
                    <i className="bi bi-bag-heart me-1"></i> Food Donor
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleQuickLogin('ngo@demo.com', 'ngo123')}
                  >
                    <i className="bi bi-building me-1"></i> Verified NGO
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-warning text-dark"
                    onClick={() => handleQuickLogin('volunteer@demo.com', 'volunteer123')}
                  >
                    <i className="bi bi-bicycle me-1"></i> Volunteer
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-dark"
                    onClick={() => handleQuickLogin('admin@foodwaste.org', 'admin123')}
                  >
                    <i className="bi bi-shield-lock me-1"></i> Admin
                  </button>
                </div>
              </div>

              <div className="text-center mt-4 pt-2">
                <span className="text-muted small">Don't have an account yet? </span>
                <Link to="/register" className="fw-semibold text-success small">
                  Create one now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
