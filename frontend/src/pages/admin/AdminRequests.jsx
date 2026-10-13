import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 10,
        status: statusFilter || undefined,
        keyword: keyword || undefined
      };
      const res = await adminService.getAllRequests(params);
      if (res.success && res.data) {
        setRequests(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      toast.error('Failed to load platform requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchRequests();
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="font-heading fw-bold mb-1">Platform Request Log</h2>
          <p className="text-muted small mb-0">System-wide monitoring of all NGO food requests, pickups, and completed deliveries</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card custom-card p-3 mb-4 bg-white border-0 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by food, donor, or NGO name..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="ACCEPTED">ACCEPTED</option>
              <option value="PICKED_UP">PICKED_UP</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="col-md-3 d-flex gap-2">
            <button type="submit" className="btn btn-primary-custom flex-grow-1 justify-content-center py-2">
              Filter
            </button>
            {(keyword || statusFilter) && (
              <button
                type="button"
                className="btn btn-secondary-custom"
                onClick={() => {
                  setKeyword('');
                  setStatusFilter('');
                  setPage(0);
                }}
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Requests Table */}
      <div className="card custom-card p-4 border-0 shadow-sm bg-white">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading platform requests...</span>
            </div>
          </div>
        ) : requests.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr className="small text-muted">
                    <th>Request ID</th>
                    <th>Food Item & Quantity</th>
                    <th>Donor Name</th>
                    <th>Requesting NGO</th>
                    <th>Requested At</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td className="fw-bold small text-muted">#{r.id}</td>
                      <td>
                        <div className="fw-semibold text-dark">{r.donation?.foodName}</div>
                        <div className="small text-success">{r.donation?.quantity} {r.donation?.quantityUnit}</div>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark small">{r.donation?.donor?.fullName}</div>
                        <div className="small text-muted">{r.donation?.donor?.email}</div>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark small">{r.ngo?.ngoName}</div>
                        <div className="small text-muted">{r.ngo?.contactPerson} ({r.ngo?.city})</div>
                      </td>
                      <td className="small text-muted">
                        <div>{new Date(r.requestedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                        {r.completedAt && (
                          <div className="text-success small">Completed: {new Date(r.completedAt).toLocaleDateString()}</div>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={r.status} />
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
            <i className="bi bi-list-check display-6 text-muted"></i>
            <h6 className="mt-3 fw-bold font-heading">No requests found</h6>
            <p className="text-muted small">No request records match the filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRequests;
