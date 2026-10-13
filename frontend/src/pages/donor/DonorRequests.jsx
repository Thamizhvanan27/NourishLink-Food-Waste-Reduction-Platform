import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import requestService from '../../services/requestService';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';

const DonorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 10,
        status: statusFilter || undefined
      };
      const res = await requestService.getRequestsForDonor(params);
      if (res.success && res.data) {
        setRequests(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      toast.error('Failed to load incoming requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      setActionLoading(requestId);
      const res = await requestService.acceptRequest(requestId);
      if (res.success) {
        toast.success('Food donation request accepted! The NGO has been notified to pick up the food.');
        fetchRequests();
      } else {
        toast.error(res.message || 'Accept failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error accepting request';
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setActionLoading(requestId);
      const res = await requestService.rejectRequest(requestId);
      if (res.success) {
        toast.info('Donation request rejected');
        fetchRequests();
      } else {
        toast.error(res.message || 'Reject failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error rejecting request';
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="font-heading fw-bold mb-1">Incoming Food Requests</h2>
          <p className="text-muted small mb-0">NGOs requesting to collect and distribute your surplus food</p>
        </div>

        <div>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="ACCEPTED">ACCEPTED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="PICKED_UP">PICKED_UP</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>
      </div>

      <div className="card custom-card p-4 border-0 shadow-sm bg-white">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading requests...</span>
            </div>
          </div>
        ) : requests.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr className="small text-muted">
                    <th>Food Item</th>
                    <th>Requesting NGO</th>
                    <th>Message & Purpose</th>
                    <th>Requested At</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div className="fw-semibold text-dark">{r.donation?.foodName}</div>
                        <div className="small text-success">{r.donation?.quantity} {r.donation?.quantityUnit}</div>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{r.ngo?.ngoName || 'NGO Partner'}</div>
                        <div className="small text-muted">
                          <i className="bi bi-geo-alt me-1"></i>{r.ngo?.city} • {r.ngo?.contactPerson}
                        </div>
                        <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                          <i className="bi bi-telephone me-1"></i>{r.ngo?.phone}
                        </div>
                      </td>
                      <td>
                        <p className="small text-secondary mb-0" style={{ maxWidth: '280px' }}>
                          {r.message || <em className="text-muted">No message included</em>}
                        </p>
                      </td>
                      <td className="small text-muted">
                        {new Date(r.requestedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="text-end">
                        {r.status === 'PENDING' ? (
                          <div className="btn-group btn-group-sm">
                            <button
                              type="button"
                              className="btn btn-success"
                              disabled={actionLoading === r.id}
                              onClick={() => handleAccept(r.id)}
                            >
                              {actionLoading === r.id ? 'Accepting...' : 'Accept'}
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              disabled={actionLoading === r.id}
                              onClick={() => handleReject(r.id)}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="small text-muted">
                            {r.status === 'ACCEPTED' && 'Awaiting NGO pickup'}
                            {r.status === 'PICKED_UP' && 'Picked up by NGO'}
                            {r.status === 'COMPLETED' && 'Distributed'}
                            {r.status === 'REJECTED' && 'Declined'}
                            {r.status === 'CANCELLED' && 'Cancelled by NGO'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-inbox display-6 text-muted"></i>
            <h6 className="mt-3 fw-bold font-heading">No requests found</h6>
            <p className="text-muted small">NGO requests for your listed donations will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorRequests;
