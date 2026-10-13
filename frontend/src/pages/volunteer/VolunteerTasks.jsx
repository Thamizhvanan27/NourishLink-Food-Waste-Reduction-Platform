import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import volunteerService from '../../services/volunteerService';

const VolunteerTasks = () => {
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'my'
  const [availableTasks, setAvailableTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [myStatusFilter, setMyStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadAvailableTasks = async () => {
    try {
      setLoading(true);
      // Fallback center: 13.0827, 80.2707 with 50km radius
      const data = await volunteerService.getNearbyTasks(13.0827, 80.2707, 100);
      setAvailableTasks(data || []);
    } catch (err) {
      toast.error('Failed to load available pickup tasks');
    } finally {
      setLoading(false);
    }
  };

  const loadMyTasks = async () => {
    try {
      setLoading(true);
      const data = await volunteerService.getMyTasks(myStatusFilter || null);
      setMyTasks(data || []);
    } catch (err) {
      toast.error('Failed to load assigned tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'available') {
      loadAvailableTasks();
    } else {
      loadMyTasks();
    }
  }, [activeTab, myStatusFilter]);

  const handleAccept = async (taskId) => {
    try {
      setActionLoadingId(taskId);
      await volunteerService.acceptTask(taskId);
      toast.success('Pickup task accepted! You can now proceed to pick up the food.');
      loadAvailableTasks();
      loadMyTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept task');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePickup = async (taskId) => {
    try {
      setActionLoadingId(taskId);
      await volunteerService.pickupTask(taskId);
      toast.success('Food collected! Proceed to deliver to the NGO.');
      loadMyTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update pickup');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeliver = async (taskId) => {
    try {
      setActionLoadingId(taskId);
      await volunteerService.deliverTask(taskId);
      toast.success('Food delivered successfully! Thank you for reducing waste.');
      loadMyTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record delivery');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="badge bg-primary">Ready for Volunteer</span>;
      case 'ACCEPTED':
        return <span className="badge bg-warning text-dark">Accepted / En Route</span>;
      case 'PICKED_UP':
        return <span className="badge bg-info text-dark">Food Collected</span>;
      case 'DELIVERED':
        return <span className="badge bg-success">Delivered</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="font-heading mb-1 text-dark d-flex align-items-center gap-2">
            <i className="bi bi-bicycle text-success"></i> Volunteer Pickup & Delivery
          </h2>
          <p className="text-muted small mb-0">
            Accept pending surplus food deliveries, transport them safely, and mark delivery status.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="btn-group shadow-xs" role="group">
          <button
            type="button"
            className={`btn ${activeTab === 'available' ? 'btn-primary-custom' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('available')}
          >
            <i className="bi bi-search me-1"></i> Available Nearby ({availableTasks.length})
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'my' ? 'btn-primary-custom' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('my')}
          >
            <i className="bi bi-person-check me-1"></i> My Deliveries ({myTasks.length})
          </button>
        </div>
      </div>

      {/* Filter Toolbar for My Tasks */}
      {activeTab === 'my' && (
        <div className="card shadow-sm border-0 rounded-4 p-3 mb-4">
          <div className="d-flex flex-wrap align-items-center gap-2">
            <span className="small fw-bold text-muted me-2">Filter By Status:</span>
            {['', 'ACCEPTED', 'PICKED_UP', 'DELIVERED'].map((st) => (
              <button
                key={st}
                type="button"
                className={`btn btn-sm rounded-pill px-3 ${
                  myStatusFilter === st ? 'btn-success text-white' : 'btn-outline-secondary'
                }`}
                onClick={() => setMyStatusFilter(st)}
              >
                {st === '' ? 'All My Tasks' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Task List */}
      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-success mb-2" role="status"></div>
          <div>Loading tasks...</div>
        </div>
      ) : activeTab === 'available' ? (
        /* Available Tasks */
        availableTasks.length === 0 ? (
          <div className="card border-0 rounded-4 p-5 text-center shadow-sm">
            <i className="bi bi-check2-circle fs-1 text-success opacity-50 d-block mb-3"></i>
            <h5>No pending pickup tasks right now</h5>
            <p className="text-muted small mb-0">
              When donors and NGOs match for food rescue, new delivery tasks will appear here.
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {availableTasks.map((task) => (
              <div key={task.id} className="col-lg-6 col-12">
                <div className="card border-0 rounded-4 p-4 shadow-sm bg-white h-100 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="font-heading mb-1 text-dark">{task.donationFoodName}</h5>
                      <span className="badge bg-success bg-opacity-10 text-success fw-bold me-2">
                        {task.donationQuantity} {task.donationUnit}
                      </span>
                      {task.donationCategory && (
                        <span className="badge bg-light text-secondary border">
                          {task.donationCategory}
                        </span>
                      )}
                    </div>
                    {getStatusBadge(task.status)}
                  </div>

                  <div className="p-3 bg-light rounded-3 mb-3 flex-grow-1">
                    <div className="mb-2">
                      <span className="text-muted small fw-bold d-block">
                        <i className="bi bi-geo-alt-fill text-danger me-1"></i> Pickup Location:
                      </span>
                      <span className="small text-dark fw-semibold">
                        {task.pickupAddress || 'Donor Address'}
                      </span>
                    </div>

                    <div className="mb-2">
                      <span className="text-muted small fw-bold d-block">
                        <i className="bi bi-building-fill text-primary me-1"></i> Delivery Destination:
                      </span>
                      <span className="small text-dark fw-semibold">
                        {task.deliveryAddress || 'NGO Facility'}
                      </span>
                      <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                        NGO Organization: <strong>{task.ngoName}</strong>
                      </div>
                    </div>

                    {task.distanceKm != null && (
                      <div className="small text-muted">
                        <i className="bi bi-compass me-1 text-secondary"></i>
                        Distance: <strong>{task.distanceKm.toFixed(1)} KM</strong>
                      </div>
                    )}
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                    <span className="text-muted small">
                      Created: {task.createdAt ? new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                    </span>
                    <button
                      className="btn btn-primary-custom"
                      disabled={actionLoadingId === task.id}
                      onClick={() => handleAccept(task.id)}
                    >
                      {actionLoadingId === task.id ? (
                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                      ) : (
                        <i className="bi bi-check-lg me-1"></i>
                      )}
                      Accept Pickup Task
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* My Assigned Tasks */
        myTasks.length === 0 ? (
          <div className="card border-0 rounded-4 p-5 text-center shadow-sm">
            <i className="bi bi-inbox fs-1 text-secondary opacity-50 d-block mb-3"></i>
            <h5>No assigned tasks found</h5>
            <p className="text-muted small mb-3">
              Switch to "Available Nearby" to find food rescues ready for transport.
            </p>
            <div>
              <button className="btn btn-primary-custom btn-sm" onClick={() => setActiveTab('available')}>
                Browse Available
              </button>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {myTasks.map((task) => (
              <div key={task.id} className="col-lg-6 col-12">
                <div className="card border-0 rounded-4 p-4 shadow-sm bg-white h-100 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="font-heading mb-1 text-dark">{task.donationFoodName}</h5>
                      <span className="badge bg-success bg-opacity-10 text-success fw-bold me-2">
                        {task.donationQuantity} {task.donationUnit}
                      </span>
                    </div>
                    {getStatusBadge(task.status)}
                  </div>

                  <div className="p-3 bg-light rounded-3 mb-3 flex-grow-1">
                    <div className="mb-2">
                      <span className="text-muted small fw-bold d-block">
                        <i className="bi bi-geo-alt-fill text-danger me-1"></i> Pickup Address:
                      </span>
                      <span className="small text-dark fw-semibold">
                        {task.pickupAddress || 'Address on file'}
                      </span>
                    </div>

                    <div className="mb-2">
                      <span className="text-muted small fw-bold d-block">
                        <i className="bi bi-building-fill text-primary me-1"></i> Delivery Address:
                      </span>
                      <span className="small text-dark fw-semibold">
                        {task.deliveryAddress || 'NGO Facility'}
                      </span>
                      <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                        NGO: <strong>{task.ngoName}</strong>
                      </div>
                    </div>

                    <div className="d-flex flex-wrap gap-3 mt-2 pt-2 border-top text-muted" style={{ fontSize: '0.78rem' }}>
                      {task.acceptedAt && (
                        <span>
                          <i className="bi bi-check me-1"></i> Accepted: {new Date(task.acceptedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      {task.pickedUpAt && (
                        <span>
                          <i className="bi bi-truck me-1"></i> Collected: {new Date(task.pickedUpAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      {task.deliveredAt && (
                        <span className="text-success fw-semibold">
                          <i className="bi bi-patch-check-fill me-1"></i> Delivered: {new Date(task.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                    {task.status === 'ACCEPTED' && (
                      <button
                        className="btn btn-outline-info"
                        disabled={actionLoadingId === task.id}
                        onClick={() => handlePickup(task.id)}
                      >
                        {actionLoadingId === task.id ? (
                          <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                        ) : (
                          <i className="bi bi-box-arrow-in-down me-1"></i>
                        )}
                        Mark Food Collected
                      </button>
                    )}

                    {task.status === 'PICKED_UP' && (
                      <button
                        className="btn btn-success text-white"
                        disabled={actionLoadingId === task.id}
                        onClick={() => handleDeliver(task.id)}
                      >
                        {actionLoadingId === task.id ? (
                          <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                        ) : (
                          <i className="bi bi-check-circle-fill me-1"></i>
                        )}
                        Mark Food Delivered
                      </button>
                    )}

                    {task.status === 'DELIVERED' && (
                      <span className="badge bg-success bg-opacity-10 text-success p-2">
                        <i className="bi bi-award-fill me-1"></i> Delivery Complete
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default VolunteerTasks;
