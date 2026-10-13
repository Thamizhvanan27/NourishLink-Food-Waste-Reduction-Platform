import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';
import Pagination from '../../components/Pagination';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 10,
        role: roleFilter || undefined,
        keyword: keyword || undefined
      };
      const res = await adminService.getUsers(params);
      if (res.success && res.data) {
        setUsers(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const handleToggleBlock = async (user) => {
    try {
      setActionLoading(user.id);
      if (user.blocked) {
        await adminService.unblockUser(user.id);
        toast.success(`User ${user.fullName} unblocked successfully`);
      } else {
        await adminService.blockUser(user.id);
        toast.info(`User ${user.fullName} blocked from platform operations`);
      }
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error updating user status';
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="font-heading fw-bold mb-1">User Management</h2>
          <p className="text-muted small mb-0">Browse platform accounts, verify contact details, and manage access privileges</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
                placeholder="Search by name, email, or city..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All Roles</option>
              <option value="ROLE_DONOR">Food Donors</option>
              <option value="ROLE_NGO">NGO Partners</option>
              <option value="ROLE_ADMIN">Platform Administrators</option>
            </select>
          </div>

          <div className="col-md-3 d-flex gap-2">
            <button type="submit" className="btn btn-primary-custom flex-grow-1 justify-content-center py-2">
              Filter
            </button>
            {(keyword || roleFilter) && (
              <button
                type="button"
                className="btn btn-secondary-custom"
                onClick={() => {
                  setKeyword('');
                  setRoleFilter('');
                  setPage(0);
                }}
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="card custom-card p-4 border-0 shadow-sm bg-white">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading users...</span>
            </div>
          </div>
        ) : users.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr className="small text-muted">
                    <th>User ID</th>
                    <th>User Profile</th>
                    <th>Role</th>
                    <th>Contact Details</th>
                    <th>Registered At</th>
                    <th>Status</th>
                    <th className="text-end">Account Control</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className={u.blocked ? 'table-danger bg-opacity-10' : ''}>
                      <td className="fw-bold small text-muted">#{u.id}</td>
                      <td>
                        <div className="fw-semibold text-dark">{u.fullName}</div>
                        <div className="small text-muted">{u.email}</div>
                      </td>
                      <td>
                        <span className={`badge ${u.role === 'ROLE_ADMIN' ? 'bg-dark' : u.role === 'ROLE_DONOR' ? 'bg-success' : 'bg-primary'}`}>
                          {u.role.replace('ROLE_', '')}
                        </span>
                      </td>
                      <td className="small text-secondary">
                        <div><i className="bi bi-geo-alt me-1 text-danger"></i>{u.city || 'N/A'}</div>
                        {u.phone && <div><i className="bi bi-telephone me-1 text-muted"></i>{u.phone}</div>}
                      </td>
                      <td className="small text-muted">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        {u.blocked ? (
                          <span className="badge bg-danger text-white">Blocked</span>
                        ) : (
                          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="text-end">
                        {u.role !== 'ROLE_ADMIN' ? (
                          <button
                            type="button"
                            className={`btn btn-sm ${u.blocked ? 'btn-success' : 'btn-outline-danger'}`}
                            disabled={actionLoading === u.id}
                            onClick={() => handleToggleBlock(u)}
                          >
                            {actionLoading === u.id ? 'Processing...' : (
                              u.blocked ? (
                                <>
                                  <i className="bi bi-unlock-fill me-1"></i> Unblock
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-slash-circle me-1"></i> Block
                                </>
                              )
                            )}
                          </button>
                        ) : (
                          <span className="small text-muted">Protected Admin</span>
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
            <i className="bi bi-people display-6 text-muted"></i>
            <h6 className="mt-3 fw-bold font-heading">No users found</h6>
            <p className="text-muted small">No user records matched your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
