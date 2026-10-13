import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import volunteerService from '../../services/volunteerService';
import { useAuth } from '../../context/AuthContext';

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    available: 0,
    accepted: 0,
    pickedUp: 0,
    delivered: 0
  });
  const [activeTasks, setActiveTasks] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, tasksData, profileData] = await Promise.all([
        volunteerService.getStats().catch(() => ({ available: 0, accepted: 0, pickedUp: 0, delivered: 0 })),
        volunteerService.getMyTasks().catch(() => []),
        volunteerService.getProfile().catch(() => null)
      ]);
      setStats(statsData || { available: 0, accepted: 0, pickedUp: 0, delivered: 0 });
      setActiveTasks(tasksData || []);
      setProfile(profileData);
    } catch (err) {
      toast.error('Failed to load volunteer dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePickup = async (taskId) => {
    try {
      await volunteerService.pickupTask(taskId);
      toast.success('Food marked as picked up from donor');
      loadData();
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  const handleDeliver = async (taskId) => {
    try {
      await volunteerService.deliverTask(taskId);
      toast.success('Food marked as delivered to NGO successfully!');
      loadData();
    } catch (err) {
      toast.error('Failed to mark delivery');
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Welcome Banner */}
      <div className="card shadow-sm border-0 rounded-4 p-4 mb-4 bg-gradient" style={{ background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)', color: 'white' }}>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <span className="badge bg-white text-success px-3 py-1 rounded-pill fw-semibold mb-2">
              <i className="bi bi-bicycle me-1"></i> Food Rescue Volunteer
            </span>
            <h2 className="font-heading mb-1 text-white">Welcome back, {user?.name}!</h2>
            <p className="mb-0 text-white-50 small">
              You are bridging donors and NGOs by delivering surplus food to communities in need.
            </p>
          </div>

          <div className="d-flex gap-2">
            <Link to="/volunteer/tasks" className="btn btn-light text-success fw-bold px-3 py-2 rounded-3 shadow-sm">
              <i className="bi bi-search me-1"></i> Browse Pickup Tasks
            </Link>
            <Link to="/volunteer/profile" className="btn btn-outline-light px-3 py-2 rounded-3">
              <i className="bi bi-person-gear me-1"></i> My Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards (Spec #38: Available, Assigned, Picked Up, Delivered) */}
      <div className="row g-3 mb-4">
        <div className="col-lg-3 col-sm-6">
          <div className="card border-0 rounded-4 p-3 shadow-sm bg-white border-start border-primary border-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-bold text-uppercase">Available Tasks</span>
                <h3 className="font-heading text-dark mb-0 mt-1">{stats.available}</h3>
              </div>
              <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle">
                <i className="bi bi-inbox fs-4"></i>
              </div>
            </div>
            <Link to="/volunteer/tasks" className="small text-primary text-decoration-none mt-2 d-inline-block fw-semibold">
              View open tasks &rarr;
            </Link>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="card border-0 rounded-4 p-3 shadow-sm bg-white border-start border-warning border-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-bold text-uppercase">Accepted / Assigned</span>
                <h3 className="font-heading text-dark mb-0 mt-1">{stats.accepted}</h3>
              </div>
              <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle">
                <i className="bi bi-clock-history fs-4"></i>
              </div>
            </div>
            <span className="small text-muted mt-2 d-inline-block">Pending pickup</span>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="card border-0 rounded-4 p-3 shadow-sm bg-white border-start border-info border-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-bold text-uppercase">In Transit</span>
                <h3 className="font-heading text-dark mb-0 mt-1">{stats.pickedUp}</h3>
              </div>
              <div className="bg-info bg-opacity-10 text-info p-3 rounded-circle">
                <i className="bi bi-truck fs-4"></i>
              </div>
            </div>
            <span className="small text-muted mt-2 d-inline-block">Picked up from donor</span>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="card border-0 rounded-4 p-3 shadow-sm bg-white border-start border-success border-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-bold text-uppercase">Food Delivered</span>
                <h3 className="font-heading text-dark mb-0 mt-1">{stats.delivered}</h3>
              </div>
              <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle">
                <i className="bi bi-patch-check-fill fs-4"></i>
              </div>
            </div>
            <span className="small text-success mt-2 d-inline-block fw-semibold">Completed rescues</span>
          </div>
        </div>
      </div>

      {/* Active Tasks & Quick Info */}
      <div className="row g-4">
        {/* Active Tasks Section */}
        <div className="col-lg-8">
          <div className="card border-0 rounded-4 p-4 shadow-sm bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="font-heading mb-0 text-dark">
                <i className="bi bi-list-task text-success me-2"></i> My Active Pickup Tasks
              </h5>
              <Link to="/volunteer/tasks" className="small text-success fw-semibold text-decoration-none">
                All Tasks &rarr;
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-4 text-muted">
                <div className="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                Loading tasks...
              </div>
            ) : activeTasks.filter((t) => t.status === 'ACCEPTED' || t.status === 'PICKED_UP').length === 0 ? (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-check-circle fs-2 text-success opacity-50 d-block mb-2"></i>
                <p className="mb-2">No active tasks right now.</p>
                <Link to="/volunteer/tasks" className="btn btn-sm btn-primary-custom">
                  Browse Available Tasks
                </Link>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {activeTasks
                  .filter((t) => t.status === 'ACCEPTED' || t.status === 'PICKED_UP')
                  .map((task) => (
                    <div key={task.id} className="p-3 rounded-3 border bg-light">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="fw-bold mb-1 text-dark">{task.donationFoodName}</h6>
                          <div className="text-muted small">
                            <span className="badge bg-success bg-opacity-10 text-success me-2">
                              {task.donationQuantity} {task.donationUnit}
                            </span>
                            <span className="text-secondary">
                              NGO: <strong>{task.ngoName}</strong>
                            </span>
                          </div>
                        </div>
                        <span
                          className={`badge ${
                            task.status === 'ACCEPTED' ? 'bg-warning text-dark' : 'bg-info text-dark'
                          }`}
                        >
                          {task.status === 'ACCEPTED' ? 'Awaiting Pickup' : 'In Transit'}
                        </span>
                      </div>

                      <div className="row g-2 text-muted small mb-3">
                        <div className="col-md-6">
                          <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                          <strong>Pickup:</strong> {task.pickupAddress || 'Address on file'}
                        </div>
                        <div className="col-md-6">
                          <i className="bi bi-building-fill text-primary me-1"></i>
                          <strong>Delivery:</strong> {task.deliveryAddress || 'NGO headquarters'}
                        </div>
                      </div>

                      <div className="d-flex justify-content-end gap-2">
                        {task.status === 'ACCEPTED' && (
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => handlePickup(task.id)}
                          >
                            <i className="bi bi-box-arrow-in-down me-1"></i> Mark Picked Up
                          </button>
                        )}
                        {task.status === 'PICKED_UP' && (
                          <button
                            className="btn btn-sm btn-success text-white"
                            onClick={() => handleDeliver(task.id)}
                          >
                            <i className="bi bi-check-circle-fill me-1"></i> Mark Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Profile / Vehicle Overview */}
        <div className="col-lg-4">
          <div className="card border-0 rounded-4 p-4 shadow-sm bg-white mb-4">
            <h5 className="font-heading mb-3 text-dark">
              <i className="bi bi-person-badge text-primary me-2"></i> Volunteer Status
            </h5>

            <div className="mb-3 pb-3 border-bottom">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted small">Vehicle Type:</span>
                <span className="badge bg-light text-dark border fw-bold">
                  <i className="bi bi-truck me-1"></i>
                  {profile?.vehicleType || 'BIKE'}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted small">Phone Contact:</span>
                <span className="fw-semibold text-dark small">{profile?.phone || 'Not provided'}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">City Zone:</span>
                <span className="fw-semibold text-dark small">{profile?.city || 'Default zone'}</span>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 mb-3">
              <span className={`badge rounded-pill ${profile?.active ? 'bg-success' : 'bg-secondary'} p-2`}></span>
              <span className="small text-muted">
                {profile?.active ? 'Active & Receiving Pickup Alerts' : 'Profile Inactive'}
              </span>
            </div>

            <Link to="/volunteer/profile" className="btn btn-outline-secondary w-100 btn-sm">
              <i className="bi bi-pencil me-1"></i> Edit Volunteer Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
