import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import requestService from '../../services/requestService';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';

const NgoRequests = () => {
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const tabs = [
    { label: 'All Requests', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'Picked Up', value: 'PICKED_UP' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];

  useEffect(() => {
    fetchRequests();
  }, [page, activeTab]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 10,
        status: activeTab || undefined
      };
      const res = await requestService.getMyRequests(params);
      if (res.success && res.data) {
        setRequests(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      toast.error('Failed to load request history');
    } finally {
      setLoading(false);
    }
  };

  const handlePickup = async (requestId) => {
    try {
      setActionLoading(requestId);
      const res = await requestService.pickupRequest(requestId);
      if (res.success) {
        toast.success('Food confirmed as picked up! Please distribute to community recipients.');
        fetchRequests();
      } else {
        toast.error(res.message || 'Pickup confirmation failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error confirming pickup';
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (requestId) => {
    try {
      setActionLoading(requestId);
      const res = await requestService.completeRequest(requestId);
      if (res.success) {
        toast.success('Donation marked as fully completed and distributed! Thank you!');
        fetchRequests();
      } else {
        toast.error(res.message || 'Complete confirmation failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error completing request';
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (requestId) => {
    try {
      setActionLoading(requestId);
      const res = await requestService.cancelRequest(requestId);
      if (res.success) {
        toast.info('Request cancelled');
        fetchRequests();
      } else {
        toast.error(res.message || 'Cancellation failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error cancelling request';
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="font-heading fw-bold mb-1">Food Request History & Workflow</h2>
          <p className="text-muted small mb-0">Track requested donations from initial inquiry to final distribution</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`btn btn-sm ${activeTab === tab.value ? 'btn-success text-white fw-semibold' : 'btn-outline-secondary'}`}
            onClick={() => {
              setActiveTab(tab.value);
              setPage(0);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Requests Table */}
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
                    <th>Donor & Location</th>
                    <th>Quantity</th>
                    <th>Timeline</th>
                    <th>Status</th>
                    <th className="text-end">Next Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div className="fw-semibold text-dark">{r.donation?.foodName}</div>
                        <span className="badge bg-light text-muted border">{r.donation?.category?.name}</span>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{r.donation?.donor?.fullName}</div>
                        <div className="small text-muted">
                          <i className="bi bi-geo-alt me-1 text-danger"></i>
                          {r.donation?.pickupAddress}, {r.donation?.city}
                        </div>
                        {r.donation?.pickupStartTime && (
                          <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                            <i className="bi bi-clock me-1"></i> Window: {r.donation?.pickupStartTime} - {r.donation?.pickupEndTime}
                          </div>
                        )}
                      </td>
                      <td className="fw-semibold text-success">
                        {r.donation?.quantity} {r.donation?.quantityUnit}
                      </td>
                      <td className="small text-muted">
                        <div>Req: {new Date(r.requestedAt).toLocaleDateString()}</div>
                        {r.acceptedAt && <div className="text-primary">Accepted: {new Date(r.acceptedAt).toLocaleDateString()}</div>}
                        {r.pickedUpAt && <div className="text-purple" style={{ color: '#7c3aed' }}>Picked: {new Date(r.pickedUpAt).toLocaleDateString()}</div>}
                        {r.completedAt && <div className="text-success fw-semibold">Done: {new Date(r.completedAt).toLocaleDateString()}</div>}
                      </td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="text-end">
                        {r.status === 'PENDING' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            disabled={actionLoading === r.id}
                            onClick={() => handleCancel(r.id)}
                          >
                            Cancel
                          </button>
                        )}

                        {r.status === 'ACCEPTED' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-primary-custom"
                            disabled={actionLoading === r.id}
                            onClick={() => handlePickup(r.id)}
                          >
                            {actionLoading === r.id ? 'Updating...' : (
                              <>
                                <i className="bi bi-truck me-1"></i> Confirm Pickup
                              </>
                            )}
                          </button>
                        )}

                        {r.status === 'PICKED_UP' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            disabled={actionLoading === r.id}
                            onClick={() => handleComplete(r.id)}
                          >
                            {actionLoading === r.id ? 'Updating...' : (
                              <>
                                <i className="bi bi-check-circle me-1"></i> Mark Completed
                              </>
                            )}
                          </button>
                        )}

                        {r.status === 'COMPLETED' && (
                          <span className="badge bg-success bg-opacity-10 text-success p-2">
                            <i className="bi bi-check-all me-1"></i> Fully Distributed
                          </span>
                        )}

                        {r.status === 'REJECTED' && (
                          <span className="small text-danger">Declined by Donor</span>
                        )}

                        {r.status === 'CANCELLED' && (
                          <span className="small text-muted">Cancelled</span>
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
            <i className="bi bi-clock-history display-6 text-muted"></i>
            <h6 className="mt-3 fw-bold font-heading">No requests found in this status</h6>
            <p className="text-muted small">You haven't made any food requests in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NgoRequests;
