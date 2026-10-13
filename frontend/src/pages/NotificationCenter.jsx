import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import notificationService from '../services/notificationService';
import wsService from '../services/websocket';
import Pagination from '../components/Pagination';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filterUnread, setFilterUnread] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(page, 10, filterUnread);
      setNotifications(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, filterUnread]);

  // Real-time notification update
  useEffect(() => {
    const unsubscribe = wsService.subscribe(() => {
      fetchNotifications();
    });
    return () => unsubscribe();
  }, [page, filterUnread]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      toast.success('Notification marked as read');
    } catch (err) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'DONATION_REQUEST':
        return <span className="badge bg-warning text-dark"><i className="bi bi-inbox me-1"></i>Request</span>;
      case 'REQUEST_ACCEPTED':
        return <span className="badge bg-success"><i className="bi bi-check-circle me-1"></i>Accepted</span>;
      case 'REQUEST_REJECTED':
        return <span className="badge bg-danger"><i className="bi bi-x-circle me-1"></i>Rejected</span>;
      case 'PICKUP':
        return <span className="badge bg-info text-dark"><i className="bi bi-truck me-1"></i>Pickup</span>;
      case 'COMPLETED':
        return <span className="badge bg-success"><i className="bi bi-patch-check me-1"></i>Completed</span>;
      case 'EXPIRY':
        return <span className="badge bg-danger"><i className="bi bi-hourglass-split me-1"></i>Expiry</span>;
      default:
        return <span className="badge bg-secondary"><i className="bi bi-bell me-1"></i>System</span>;
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="font-heading mb-1 text-dark d-flex align-items-center gap-2">
            <i className="bi bi-bell-fill text-success"></i> Notification Center
          </h2>
          <p className="text-muted small mb-0">
            Real-time updates, donation requests, pickup reminders, and platform alerts
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn btn-sm ${!filterUnread ? 'btn-primary-custom' : 'btn-outline-secondary'}`}
              onClick={() => { setFilterUnread(false); setPage(0); }}
            >
              All Alerts
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterUnread ? 'btn-primary-custom' : 'btn-outline-secondary'}`}
              onClick={() => { setFilterUnread(true); setPage(0); }}
            >
              Unread Only
            </button>
          </div>

          <button
            className="btn btn-sm btn-outline-success"
            onClick={handleMarkAllAsRead}
            disabled={notifications.every((n) => n.isRead)}
          >
            <i className="bi bi-check2-all me-1"></i> Mark All as Read
          </button>
        </div>
      </div>

      {/* Main List */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        {loading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border text-success mb-3" role="status"></div>
            <div>Loading notifications...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-inbox fs-1 text-secondary opacity-50 d-block mb-3"></i>
            <h5>No notifications found</h5>
            <p className="small text-muted mb-0">
              {filterUnread
                ? 'You have caught up with all your notifications!'
                : 'Any updates about donation requests, pickups, and alerts will appear here.'}
            </p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`list-group-item p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 transition-all ${
                  !notif.isRead ? 'bg-success bg-opacity-10 border-start border-success border-4' : ''
                }`}
              >
                <div className="d-flex align-items-start gap-3 flex-grow-1">
                  <div
                    className="rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: '42px',
                      height: '42px',
                      backgroundColor: !notif.isRead ? '#d1fae5' : '#f1f5f9'
                    }}
                  >
                    <i
                      className={`bi ${
                        notif.type === 'DONATION_REQUEST'
                          ? 'bi-inbox-fill text-warning'
                          : notif.type === 'REQUEST_ACCEPTED'
                          ? 'bi-check-circle-fill text-success'
                          : notif.type === 'EXPIRY'
                          ? 'bi-clock-fill text-danger'
                          : 'bi-bell-fill text-primary'
                      }`}
                    ></i>
                  </div>

                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <h6 className="mb-0 fw-bold text-dark">{notif.title}</h6>
                      {getTypeBadge(notif.type)}
                      {!notif.isRead && (
                        <span className="badge bg-danger rounded-pill" style={{ fontSize: '0.65rem' }}>
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="mb-2 text-secondary small">{notif.message}</p>
                    <div className="d-flex align-items-center gap-3 text-muted" style={{ fontSize: '0.78rem' }}>
                      <span>
                        <i className="bi bi-clock me-1"></i>
                        {new Date(notif.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}{' '}
                        at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                  {notif.referenceId && (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => navigate(`/donations/${notif.referenceId}`)}
                    >
                      <i className="bi bi-arrow-up-right-circle me-1"></i> View Item
                    </button>
                  )}

                  {!notif.isRead && (
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => handleMarkAsRead(notif.id)}
                      title="Mark as read"
                    >
                      <i className="bi bi-check2"></i>
                    </button>
                  )}

                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(notif.id)}
                    title="Delete notification"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-3 border-top d-flex justify-content-center">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
