import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../../services/authService';

const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [role, setRole] = useState('ROLE_DONOR');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  // NGO specific fields
  const [ngoName, setNgoName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [description, setDescription] = useState('');

  // Volunteer specific fields
  const [vehicleType, setVehicleType] = useState('BIKE');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'ngo') {
      setRole('ROLE_NGO');
    } else if (roleParam === 'donor') {
      setRole('ROLE_DONOR');
    } else if (roleParam === 'volunteer') {
      setRole('ROLE_VOLUNTEER');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.warning('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.warning('Passwords do not match');
      return;
    }

    if (role === 'ROLE_NGO' && !registrationNumber) {
      toast.warning('NGO registration number is required');
      return;
    }

    const payload = {
      fullName,
      email,
      phone,
      password,
      address,
      city,
      role,
      ngoName: role === 'ROLE_NGO' ? (ngoName || fullName) : null,
      registrationNumber: role === 'ROLE_NGO' ? registrationNumber : null,
      contactPerson: role === 'ROLE_NGO' ? (contactPerson || fullName) : null,
      description: role === 'ROLE_NGO' ? description : null,
      vehicleType: role === 'ROLE_VOLUNTEER' ? vehicleType : null
    };

    try {
      setLoading(true);
      const res = await authService.register(payload);
      if (res.success) {
        if (role === 'ROLE_NGO') {
          toast.success('NGO registered successfully! Your account is submitted for Admin approval. You can now log in.');
        } else if (role === 'ROLE_VOLUNTEER') {
          toast.success('Volunteer account created! Please sign in to start rescuing surplus food.');
        } else {
          toast.success('Registration successful! Please sign in with your credentials.');
        }
        navigate('/login');
      } else {
        toast.error(res.message || 'Registration failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration error occurred';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5 bg-light" style={{ minHeight: '85vh' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-7 col-md-10">
            <div className="card custom-card p-4 p-md-5 border-0 shadow-lg">
              <div className="text-center mb-4">
                <span style={{ fontSize: '2.5rem' }}>🌱</span>
                <h3 className="font-heading fw-bold mt-2">Join NourishLink</h3>
                <p className="text-muted small">Choose your role and help eliminate surplus food waste</p>
              </div>

              {/* Role Toggle Tabs */}
              <div className="d-flex p-1 bg-light rounded-3 mb-4 border">
                <button
                  type="button"
                  className={`btn flex-fill py-2 fw-semibold ${role === 'ROLE_DONOR' ? 'btn-white bg-white shadow-sm text-success' : 'text-muted'}`}
                  onClick={() => setRole('ROLE_DONOR')}
                >
                  <i className="bi bi-heart-fill me-2 text-danger"></i> Food Donor
                </button>
                <button
                  type="button"
                  className={`btn flex-fill py-2 fw-semibold ${role === 'ROLE_NGO' ? 'btn-white bg-white shadow-sm text-primary' : 'text-muted'}`}
                  onClick={() => setRole('ROLE_NGO')}
                >
                  <i className="bi bi-building me-2 text-primary"></i> NGO / Charity
                </button>
                <button
                  type="button"
                  className={`btn flex-fill py-2 fw-semibold ${role === 'ROLE_VOLUNTEER' ? 'btn-white bg-white shadow-sm text-warning' : 'text-muted'}`}
                  onClick={() => setRole('ROLE_VOLUNTEER')}
                >
                  <i className="bi bi-bicycle me-2 text-warning"></i> Volunteer
                </button>
              </div>

              {role === 'ROLE_NGO' && (
                <div className="alert alert-info border-0 d-flex align-items-center gap-2 mb-4 py-2 small">
                  <i className="bi bi-info-circle-fill fs-5"></i>
                  <span>NGO accounts undergo Admin verification before food requests can be approved.</span>
                </div>
              )}

              {role === 'ROLE_VOLUNTEER' && (
                <div className="alert alert-warning border-0 d-flex align-items-center gap-2 mb-4 py-2 small bg-warning bg-opacity-10 text-dark">
                  <i className="bi bi-bicycle fs-5 text-warning"></i>
                  <span>Volunteers pick up surplus food donations and transport them to NGO shelter points.</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">
                      {role === 'ROLE_DONOR' ? 'Your Name / Business Name *' : 'Account Admin Name *'}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={role === 'ROLE_DONOR' ? 'e.g. Green Valley Cafe' : 'e.g. Sarah Jenkins'}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="name@organization.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+1-555-0199"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
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

                  <div className="col-12">
                    <label className="form-label fw-semibold small">Street Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="123 Food Haven Way"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  {/* NGO Additional Fields */}
                  {role === 'ROLE_NGO' && (
                    <>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">Official NGO Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Hope Harvest Foundation"
                          value={ngoName}
                          onChange={(e) => setNgoName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">Registration / License Number *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. NGO-REG-2024-1029"
                          value={registrationNumber}
                          onChange={(e) => setRegistrationNumber(e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">Contact Person Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Lead Coordinator"
                          value={contactPerson}
                          onChange={(e) => setContactPerson(e.target.value)}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">Mission / Description</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Communities served, shelter details..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {role === 'ROLE_VOLUNTEER' && (
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Vehicle Type *</label>
                      <select
                        className="form-select"
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        required
                      >
                        <option value="BIKE">Two-Wheeler / Bike</option>
                        <option value="CAR">Four-Wheeler / Car</option>
                        <option value="VAN">Van / Small Truck</option>
                        <option value="OTHER">Other / Cargo Scooter</option>
                      </select>
                    </div>
                  )}

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Password (Min. 6 chars) *</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Confirm Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary-custom w-100 py-3 mt-4 justify-content-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Registering Account...
                    </>
                  ) : (
                    role === 'ROLE_DONOR' ? 'Create Donor Account' : 'Register NGO for Verification'
                  )}
                </button>
              </form>

              <div className="text-center mt-4 pt-2">
                <span className="text-muted small">Already registered? </span>
                <Link to="/login" className="fw-semibold text-success small">
                  Sign in here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
