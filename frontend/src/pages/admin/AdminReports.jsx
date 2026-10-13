import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import reportService from '../../services/reportService';
import categoryService from '../../services/categoryService';

const AdminReports = () => {
  const [categories, setCategories] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [impactYear, setImpactYear] = useState(new Date().getFullYear());
  const [impactMonth, setImpactMonth] = useState(new Date().getMonth() + 1);

  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingImpact, setDownloadingImpact] = useState(false);

  useEffect(() => {
    categoryService.getAllCategories().then((res) => setCategories(res || [])).catch(() => {});
  }, []);

  const handleDownloadCsv = async () => {
    try {
      setDownloadingCsv(true);
      await reportService.downloadDonationsCsv(statusFilter || null, categoryFilter || null);
      toast.success('Donations CSV report downloaded successfully');
    } catch (err) {
      toast.error('Failed to generate CSV report');
    } finally {
      setDownloadingCsv(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      await reportService.downloadDonationsPdf(statusFilter || null, categoryFilter || null);
      toast.success('Donations PDF report downloaded successfully');
    } catch (err) {
      toast.error('Failed to generate PDF report');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadImpactPdf = async () => {
    try {
      setDownloadingImpact(true);
      await reportService.downloadImpactPdf(impactYear, impactMonth);
      toast.success('Monthly Impact Summary PDF downloaded successfully');
    } catch (err) {
      toast.error('Failed to generate Impact PDF report');
    } finally {
      setDownloadingImpact(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="font-heading mb-1 text-dark d-flex align-items-center gap-2">
          <i className="bi bi-file-earmark-bar-graph text-success"></i> Reports & Data Export Center
        </h2>
        <p className="text-muted small mb-0">
          Generate audit-ready, high-resolution PDF summaries and machine-readable CSV exports with role-based access control.
        </p>
      </div>

      <div className="row g-4">
        {/* Donation Records Export Card */}
        <div className="col-lg-6 col-12">
          <div className="card shadow-sm border-0 rounded-4 p-4 bg-white h-100 d-flex flex-column">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="p-3 bg-success bg-opacity-10 text-success rounded-circle">
                <i className="bi bi-table fs-4"></i>
              </div>
              <div>
                <h5 className="font-heading mb-0 text-dark">Donation Activity Records</h5>
                <small className="text-muted">Export itemized food rescue ledger</small>
              </div>
            </div>

            <p className="text-secondary small mb-4">
              Includes Food Name, Category, Quantity, Unit, Donor, NGO, City, Pickup Times, Status, and Timestamps.
            </p>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Filter by Status</label>
                <select
                  className="form-select rounded-3"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="REQUESTED">REQUESTED</option>
                  <option value="ACCEPTED">ACCEPTED</option>
                  <option value="PICKED_UP">PICKED_UP</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="EXPIRED">EXPIRED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Filter by Category</label>
                <select
                  className="form-select rounded-3"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-auto d-flex flex-wrap gap-2 pt-3 border-top">
              <button
                className="btn btn-primary-custom flex-grow-1"
                disabled={downloadingCsv}
                onClick={handleDownloadCsv}
              >
                {downloadingCsv ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                ) : (
                  <i className="bi bi-file-earmark-spreadsheet me-2"></i>
                )}
                Export as CSV (.csv)
              </button>

              <button
                className="btn btn-outline-danger flex-grow-1"
                disabled={downloadingPdf}
                onClick={handleDownloadPdf}
              >
                {downloadingPdf ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                ) : (
                  <i className="bi bi-file-earmark-pdf me-2"></i>
                )}
                Export as PDF (.pdf)
              </button>
            </div>
          </div>
        </div>

        {/* Executive Impact Summary PDF Card */}
        <div className="col-lg-6 col-12">
          <div className="card shadow-sm border-0 rounded-4 p-4 bg-white h-100 d-flex flex-column">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-circle">
                <i className="bi bi-award fs-4"></i>
              </div>
              <div>
                <h5 className="font-heading mb-0 text-dark">Executive Impact Report</h5>
                <small className="text-muted">Monthly formatted sustainability report</small>
              </div>
            </div>

            <p className="text-secondary small mb-4">
              Generates an executive-ready PDF report highlighting Total Food Rescued (KG), Estimated Meals Provided, Environmental Savings, and Completed Rescues.
            </p>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Select Year</label>
                <select
                  className="form-select rounded-3"
                  value={impactYear}
                  onChange={(e) => setImpactYear(parseInt(e.target.value))}
                >
                  {[2024, 2025, 2026, 2027].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Select Month</label>
                <select
                  className="form-select rounded-3"
                  value={impactMonth}
                  onChange={(e) => setImpactMonth(parseInt(e.target.value))}
                >
                  {[
                    { m: 1, label: 'January' },
                    { m: 2, label: 'February' },
                    { m: 3, label: 'March' },
                    { m: 4, label: 'April' },
                    { m: 5, label: 'May' },
                    { m: 6, label: 'June' },
                    { m: 7, label: 'July' },
                    { m: 8, label: 'August' },
                    { m: 9, label: 'September' },
                    { m: 10, label: 'October' },
                    { m: 11, label: 'November' },
                    { m: 12, label: 'December' }
                  ].map((item) => (
                    <option key={item.m} value={item.m}>{item.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-auto pt-3 border-top">
              <button
                className="btn btn-outline-primary w-100 py-2 fw-semibold"
                disabled={downloadingImpact}
                onClick={handleDownloadImpactPdf}
              >
                {downloadingImpact ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                ) : (
                  <i className="bi bi-file-earmark-pdf-fill me-2"></i>
                )}
                Download Impact PDF Summary
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
