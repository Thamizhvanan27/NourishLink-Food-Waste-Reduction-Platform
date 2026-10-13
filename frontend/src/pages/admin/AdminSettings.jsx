import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import settingService from '../../services/settingService';

const AdminSettings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editValues, setEditValues] = useState({});
  const [updatingKey, setUpdatingKey] = useState(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingService.getSettings();
      setSettings(data || []);
      const initialMap = {};
      (data || []).forEach((s) => {
        initialMap[s.settingKey] = s.settingValue;
      });
      setEditValues(initialMap);
    } catch (err) {
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (key) => {
    try {
      setUpdatingKey(key);
      await settingService.updateSetting(key, editValues[key]);
      toast.success(`System setting '${key}' updated successfully`);
      fetchSettings();
    } catch (err) {
      toast.error('Failed to update system setting');
    } finally {
      setUpdatingKey(null);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h2 className="font-heading mb-1 text-dark d-flex align-items-center gap-2">
          <i className="bi bi-sliders text-primary"></i> Global System Settings & Impact Ratios
        </h2>
        <p className="text-muted small mb-0">
          Configure runtime constants, automated reminder flags, and food-to-meal conversion multipliers without code changes.
        </p>
      </div>

      <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white">
        {loading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border text-success mb-2" role="status"></div>
            <div>Loading settings...</div>
          </div>
        ) : settings.length === 0 ? (
          <div className="p-5 text-center text-muted">No system settings initialized yet.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3 px-4" style={{ minWidth: '220px' }}>Configuration Key</th>
                  <th className="py-3" style={{ minWidth: '280px' }}>Description & Impact</th>
                  <th className="py-3" style={{ minWidth: '220px' }}>Active Setting Value</th>
                  <th className="py-3 text-end px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {settings.map((s) => (
                  <tr key={s.id}>
                    <td className="py-3 px-4">
                      <span className="fw-bold font-monospace text-dark">{s.settingKey}</span>
                    </td>
                    <td className="py-3">
                      <span className="text-muted small">{s.description || 'Global platform configuration'}</span>
                    </td>
                    <td className="py-3">
                      {s.settingKey.includes('REMINDER') ? (
                        <select
                          className="form-select form-select-sm rounded-3"
                          value={editValues[s.settingKey] || 'false'}
                          onChange={(e) =>
                            setEditValues({ ...editValues, [s.settingKey]: e.target.value })
                          }
                        >
                          <option value="true">True (Enabled)</option>
                          <option value="false">False (Disabled)</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          className="form-control form-control-sm rounded-3"
                          value={editValues[s.settingKey] || ''}
                          onChange={(e) =>
                            setEditValues({ ...editValues, [s.settingKey]: e.target.value })
                          }
                        />
                      )}
                    </td>
                    <td className="py-3 text-end px-4">
                      <button
                        className="btn btn-sm btn-primary-custom"
                        disabled={updatingKey === s.settingKey || editValues[s.settingKey] === s.settingValue}
                        onClick={() => handleSave(s.settingKey)}
                      >
                        {updatingKey === s.settingKey ? (
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                        ) : (
                          <>
                            <i className="bi bi-check2 me-1"></i> Update
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
