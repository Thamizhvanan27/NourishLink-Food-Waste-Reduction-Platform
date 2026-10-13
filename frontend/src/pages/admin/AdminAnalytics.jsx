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

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const result = await analyticsService.getAdminAnalytics();
        setData(result);
      } catch (err) {
        toast.error('Failed to load platform analytics data');
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
        <div>Generating dynamic analytics dashboards from live database metrics...</div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="font-heading mb-1 text-dark d-flex align-items-center gap-2">
            <i className="bi bi-graph-up text-primary"></i> Platform Analytics & Impact Metrics
          </h2>
          <p className="text-muted small mb-0">
            Real-time visual reports tracking surplus food volume, carbon rescue, meals diverted, and community distribution.
          </p>
        </div>
      </div>

      {/* Impact KPI Summary Row */}
      <div className="row g-3 mb-4">
        <div className="col-lg-3 col-sm-6">
          <div className="card border-0 rounded-4 p-3 shadow-sm bg-white border-start border-success border-4">
            <span className="text-muted small fw-bold text-uppercase">Food Rescued</span>
            <h3 className="font-heading text-dark mb-0 mt-1">
              {data?.totalFoodRescuedKg ? `${data.totalFoodRescuedKg.toFixed(1)} KG` : '0 KG'}
            </h3>
            <span className="text-success small fw-semibold">
              <i className="bi bi-tree-fill me-1"></i> Rescued from landfill
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
              <i className="bi bi-heart-fill me-1"></i> Hunger alleviation impact
            </span>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="card border-0 rounded-4 p-3 shadow-sm bg-white border-start border-primary border-4">
            <span className="text-muted small fw-bold text-uppercase">Total Food Donations</span>
            <h3 className="font-heading text-dark mb-0 mt-1">{data?.totalDonations || 0}</h3>
            <span className="text-muted small">Registered in system</span>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="card border-0 rounded-4 p-3 shadow-sm bg-white border-start border-info border-4">
            <span className="text-muted small fw-bold text-uppercase">Active Ecosystem</span>
            <h3 className="font-heading text-dark mb-0 mt-1">
              {(data?.totalDonors || 0) + (data?.totalNgos || 0) + (data?.totalVolunteers || 0)}
            </h3>
            <span className="text-info small fw-semibold">
              {data?.totalDonors || 0} Donors · {data?.totalNgos || 0} NGOs · {data?.totalVolunteers || 0} Volunteers
            </span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="row g-4">
        {/* Monthly Donations Chart */}
        <div className="col-lg-6 col-12">
          <div className="card border-0 rounded-4 p-4 shadow-sm bg-white h-100">
            <h5 className="font-heading mb-3 text-dark d-flex align-items-center gap-2">
              <i className="bi bi-calendar3 text-primary"></i> Monthly Food Donations
            </h5>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.donationsPerMonth || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend />
                  <Bar dataKey="count" name="Donations" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Food Rescued Per Month (KG) */}
        <div className="col-lg-6 col-12">
          <div className="card border-0 rounded-4 p-4 shadow-sm bg-white h-100">
            <h5 className="font-heading mb-3 text-dark d-flex align-items-center gap-2">
              <i className="bi bi-speedometer2 text-success"></i> Food Rescued Trend (KG)
            </h5>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.donationsPerMonth || []}>
                  <defs>
                    <linearGradient id="rescuedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#rescuedGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Donation Status Breakdown */}
        <div className="col-lg-4 col-12">
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
                  <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Food Categories Distribution */}
        <div className="col-lg-4 col-12">
          <div className="card border-0 rounded-4 p-4 shadow-sm bg-white h-100">
            <h5 className="font-heading mb-3 text-dark d-flex align-items-center gap-2">
              <i className="bi bi-tag text-info"></i> Food Category Distribution
            </h5>
            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={data?.categoryBreakdown || []}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="label" stroke="#64748b" fontSize={11} width={85} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="count" name="Donations" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* City-wise Donations */}
        <div className="col-lg-4 col-12">
          <div className="card border-0 rounded-4 p-4 shadow-sm bg-white h-100">
            <h5 className="font-heading mb-3 text-dark d-flex align-items-center gap-2">
              <i className="bi bi-geo-alt text-danger"></i> City-wise Activity
            </h5>
            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.cityBreakdown || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="count" name="City Donations" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
