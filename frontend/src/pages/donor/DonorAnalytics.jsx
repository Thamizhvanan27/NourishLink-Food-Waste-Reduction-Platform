import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { toast } from 'react-toastify';
import analyticsService from '../../services/analyticsService';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const DonorAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const result = await analyticsService.getDonorAnalytics();
        setData(result);
      } catch (err) {
        toast.error('Failed to load donor impact analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center text-muted">
        <div className="spinner-border text-success mb-3" role="status"></div>
        <div>Calculating your food rescue metrics and charts...</div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="font-heading mb-1 text-dark d-flex align-items-center gap-2">
            <i className="bi bi-graph-up text-success"></i> Donor Impact & Activity Analytics
          </h2>
          <p className="text-muted small mb-0">
            Track your surplus food contributions, estimated meals provided to communities, and monthly trends.
          </p>
        </div>
      </div>

      {/* Impact Stat Cards (Spec #18: Total Food Rescued, Meals Provided, Completed Donations) */}
      <div className="row g-3 mb-4">
        <div className="col-lg-3 col-sm-6">
          <div className="card border-0 rounded-4 p-3 shadow-sm bg-white border-start border-success border-4">
            <span className="text-muted small fw-bold text-uppercase">Food Rescued</span>
            <h3 className="font-heading text-dark mb-0 mt-1">
              {data?.totalRescuedKg ? `${data.totalRescuedKg.toFixed(1)} KG` : '0 KG'}
            </h3>
            <span className="text-success small fw-semibold">
              <i className="bi bi-tree me-1"></i> Rescued from waste
            </span>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="card border-0 rounded-4 p-3 shadow-sm bg-white border-start border-warning border-4">
            <span className="text-muted small fw-bold text-uppercase">Estimated Meals Provided</span>
            <h3 className="font-heading text-dark mb-0 mt-1">
              {data?.estimatedMealsRescued || 0}
            </h3>
            <span className="text-warning small fw-semibold">
              <i className="bi bi-heart-fill me-1"></i> Community meals served
            </span>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="card border-0 rounded-4 p-3 shadow-sm bg-white border-start border-primary border-4">
            <span className="text-muted small fw-bold text-uppercase">Completed Rescues</span>
            <h3 className="font-heading text-dark mb-0 mt-1">
              {data?.completedDonations || 0}
            </h3>
            <span className="text-primary small fw-semibold">
              <i className="bi bi-patch-check me-1"></i> Picked up & delivered
            </span>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="card border-0 rounded-4 p-3 shadow-sm bg-white border-start border-info border-4">
            <span className="text-muted small fw-bold text-uppercase">Total Food Listings</span>
            <h3 className="font-heading text-dark mb-0 mt-1">{data?.totalDonations || 0}</h3>
            <span className="text-muted small">Registered in NourishLink</span>
          </div>
        </div>
      </div>

      {/* Recharts Grid */}
      <div className="row g-4">
        {/* Monthly Donations */}
        <div className="col-lg-6 col-12">
          <div className="card border-0 rounded-4 p-4 shadow-sm bg-white h-100">
            <h5 className="font-heading mb-3 text-dark d-flex align-items-center gap-2">
              <i className="bi bi-bar-chart-line text-success"></i> Monthly Donations
            </h5>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.monthlyDonations || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                  <Legend />
                  <Bar dataKey="count" name="Donations" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Monthly Food Rescued (KG) */}
        <div className="col-lg-6 col-12">
          <div className="card border-0 rounded-4 p-4 shadow-sm bg-white h-100">
            <h5 className="font-heading mb-3 text-dark d-flex align-items-center gap-2">
              <i className="bi bi-speedometer2 text-primary"></i> Monthly Food Rescued (KG)
            </h5>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.monthlyDonations || []}>
                  <defs>
                    <linearGradient id="donorRescuedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                    formatter={(val) => [`${Number(val).toFixed(1)} KG`, 'Food Rescued']}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="rescuedKg"
                    name="Rescued (KG)"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#donorRescuedGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Donation Status Breakdown */}
        <div className="col-lg-6 col-12">
          <div className="card border-0 rounded-4 p-4 shadow-sm bg-white h-100">
            <h5 className="font-heading mb-3 text-dark d-flex align-items-center gap-2">
              <i className="bi bi-pie-chart text-warning"></i> Donation Status Breakdown
            </h5>
            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.statusBreakdown || []}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={50}
                    paddingAngle={3}
                  >
                    {(data?.statusBreakdown || []).map((entry, index) => (
                      <Cell key={`status-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                  <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Food Category Distribution */}
        <div className="col-lg-6 col-12">
          <div className="card border-0 rounded-4 p-4 shadow-sm bg-white h-100">
            <h5 className="font-heading mb-3 text-dark d-flex align-items-center gap-2">
              <i className="bi bi-tag text-info"></i> Food Category Distribution
            </h5>
            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.categoryBreakdown || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="count" name="Donations" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorAnalytics;
