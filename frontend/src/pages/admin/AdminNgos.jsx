import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';
import Pagination from '../../components/Pagination';

const AdminNgos = () => {
  const [ngos, setNgos] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved' | 'all'
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchNgos();
  }, [page, activeTab]);

  const fetchNgos = async () => {
    try {
      setLoading(true);
      let approvedParam = undefined;
      if (activeTab === 'pending') approvedParam = false;
      else if (activeTab === 'approved') approvedParam = true;

      const params = {
        page,
        size: 10,
        approved: approvedParam,
        keyword: keyword || undefined
      };

      const res = await adminService.getNgos(params);
      if (res.success && res.data) {
        setNgos(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      toast.error('Failed to load NGOs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchNgos();
  };

  const handleApprove = async (ngo) => {
    try {
      setActionLoading(ngo.id);
      const res = await adminService.approveNgo(ngo.id);
      if (res.success) {
        toast.success(`NGO "${ngo.ngoName}" approved successfully! They can now request food.`);
        fetchNgos();
      } else {
        toast.error(res.message || 'Approval failed');
      }
    } catch (err) {
      toast.error('Error approving NGO');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (ngo) => {
    try {
      setActionLoading(ngo.id);
      const res = await adminService.rejectNgo(ngo.id);
      if (res.success) {
        toast.info(`NGO "${ngo.ngoName}" approval status revoked/rejected.`);
        fetchNgos();
      } else {
        toast.error(res.message || 'Action failed');
      }
    } catch (err) {
      toast.error('Error updating NGO status');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="font-heading fw-bold mb-1">NGO Verification & Governance</h2>
          <p className="text-muted small mb-0">Review charitable organizations and approve verified food relief partners</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'pending' ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary'}`}
          onClick={() => { setActiveTab('pending'); setPage(0); }}
        >
          <i className="bi bi-hourglass-split me-1"></i> Pending Approval
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'approved' ? 'btn-success text-white fw-bold' : 'btn-outline-secondary'}`}
          onClick={() => { setActiveTab('approved'); setPage(0); }}
        >
          <i className="bi bi-patch-check-fill me-1"></i> Approved Partners
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'all' ? 'btn-dark text-white fw-bold' : 'btn-outline-secondary'}`}
          onClick={() => { setActiveTab('all'); setPage(0); }}
        >
          All NGOs
        </button>
      </div>

      {/* Search Bar */}
      <div className="card custom-card p-3 mb-4 bg-white border-0 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="d-flex gap-2">
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search by NGO name, registration number, city, or contact person..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary-custom px-4">
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="card custom-card p-4 border-0 shadow-sm bg-white">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading NGOs...</span>
            </div>
          </div>
        ) : ngos.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr className="small text-muted">
                    <th>Organization</th>
                    <th>Registration #</th>
                    <th>Contact Person</th>
                    <th>Location</th>
                    <th>Registration Date</th>
                    <th>Approval Status</th>
                    <th className="text-end">Verification Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ngos.map((ngo) => (
                    <tr key={ngo.id}>
                      <td>
                        <div className="fw-semibold text-dark">{ngo.ngoName}</div>
                        <div className="small text-muted">{ngo.email}</div>
                        {ngo.description && (
                          <div className="text-muted small text-truncate" style={{ maxWidth: '240px' }} title={ngo.description}>
                            {ngo.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark font-monospace border px-2 py-1">
                          {ngo.registrationNumber}
                        </span>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark small">{ngo.contactPerson}</div>
                        <div className="small text-muted">{ngo.phone || 'No phone'}</div>
                      </td>
                      <td className="small text-secondary">
                        <i className="bi bi-geo-alt me-1 text-danger"></i>
                        {ngo.city}
                      </td>
                      <td className="small text-muted">
                        {new Date(ngo.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        {ngo.approved ? (
                          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">
                            <i className="bi bi-check-circle-fill me-1"></i> Approved
                          </span>
                        ) : (
                          <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-2 py-1">
                            <i className="bi bi-hourglass me-1"></i> Awaiting Review
                          </span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          {!ngo.approved ? (
                            <button
                              type="button"
                              className="btn btn-success"
                              disabled={actionLoading === ngo.id}
                              onClick={() => handleApprove(ngo)}
                            >
                              {actionLoading === ngo.id ? 'Approving...' : 'Approve NGO'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              disabled={actionLoading === ngo.id}
                              onClick={() => handleReject(ngo)}
                            >
                              Revoke Approval
                            </button>
                          )}
                        </div>
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
            <i className="bi bi-patch-check display-6 text-muted"></i>
            <h6 className="mt-3 fw-bold font-heading">No NGO records in this view</h6>
            <p className="text-muted small">All NGO registrations are processed or none match the keyword.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNgos;
