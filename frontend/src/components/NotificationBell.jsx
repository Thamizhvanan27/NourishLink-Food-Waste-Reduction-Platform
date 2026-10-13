import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import wsService from '../services/websocket';
import notificationService from '../services/notificationService';

const NotificationBell = () => {
  const { user, token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const loadUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.error('Failed to load unread notification count', err);
    }
  };

  const loadRecent = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(0, 5);
      setRecentNotifications(data.content || []);
    } catch (err) {
      console.error('Failed to load recent notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !token) return;

    loadUnreadCount();

    // Connect WebSocket
    wsService.connect(user.userId, token);

    // Subscribe to incoming notifications
    const unsubscribe = wsService.subscribe((newNotif) => {
      setUnreadCount((prev) => prev + 1);
      setRecentNotifications((prev) => [newNotif, ...prev.slice(0, 4)]);
      toast.info(`🔔 ${newNotif.title}: ${newNotif.message}`, {
        onClick: () => navigate('/notifications')
      });
    });

    return () => {
      unsubscribe();
    };
  }, [user, token]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      loadRecent();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setRecentNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setRecentNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button
        id="notification-bell-btn"
        className="btn btn-light position-relative p-2 rounded-circle d-flex align-items-center justify-content-center shadow-xs"
        style={{ width: '42px', height: '42px', border: '1px solid var(--border)' }}
        onClick={handleToggle}
        title="Notifications"
        aria-label="Notifications"
      >
        <i className="bi bi-bell-fill fs-5" style={{ color: unreadCount > 0 ? '#10b981' : '#64748b' }}></i>
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white"
            style={{ fontSize: '0.68rem', padding: '0.35em 0.55em' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="dropdown-menu dropdown-menu-end show shadow-lg border-0 rounded-4 mt-2 p-0"
          style={{ width: '360px', zIndex: 1050 }}
        >
          <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light rounded-top-4">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-bell text-success fw-bold"></i>
              <span className="fw-bold text-dark">Notifications</span>
              {unreadCount > 0 && (
                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                className="btn btn-link btn-sm text-decoration-none p-0 text-success fw-medium small"
                onClick={handleMarkAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center py-4 text-muted small">
                <div className="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                Loading notifications...
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                <i className="bi bi-bell-slash fs-3 d-block text-secondary opacity-50 mb-2"></i>
                No notifications right now
              </div>
            ) : (
              recentNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 border-bottom transition-all ${
                    !notif.isRead ? 'bg-success bg-opacity-10' : 'hover-bg-light'
                  }`}
                  style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                  onClick={() => {
                    if (!notif.isRead) handleMarkAsRead(notif.id, { stopPropagation: () => {} });
                    setIsOpen(false);
                    if (notif.referenceId) {
                      navigate(`/donations/${notif.referenceId}`);
                    } else {
                      navigate('/notifications');
                    }
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <span className="fw-semibold text-dark small">{notif.title}</span>
                    {!notif.isRead && (
                      <span
                        className="badge bg-success rounded-pill ms-2"
                        style={{ width: '8px', height: '8px', padding: 0 }}
                        title="Unread"
                      ></span>
                    )}
                  </div>
                  <p className="text-muted small mb-1" style={{ fontSize: '0.8rem', lineHeight: '1.3' }}>
                    {notif.message}
                  </p>
                  <div className="d-flex justify-content-between align-items-center text-muted" style={{ fontSize: '0.72rem' }}>
                    <span>
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                    {!notif.isRead && (
                      <button
                        className="btn btn-link btn-sm p-0 text-secondary text-decoration-none"
                        style={{ fontSize: '0.72rem' }}
                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2 text-center bg-light border-top rounded-bottom-4">
            <Link
              to="/notifications"
              className="text-success fw-semibold small text-decoration-none"
              onClick={() => setIsOpen(false)}
            >
              View all notifications <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
