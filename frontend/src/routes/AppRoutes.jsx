import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Route Guards
import RoleProtectedRoute from './RoleProtectedRoute';

// Public Pages
import Home from '../pages/public/Home';
import About from '../pages/public/About';
import HowItWorks from '../pages/public/HowItWorks';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import ForgotPassword from '../pages/public/ForgotPassword';
import ResetPassword from '../pages/public/ResetPassword';
import DonationDetails from '../pages/DonationDetails';
import NotificationCenter from '../pages/NotificationCenter';
import NotFound from '../pages/NotFound';

// Donor Pages
import DonorDashboard from '../pages/donor/DonorDashboard';
import MyDonations from '../pages/donor/MyDonations';
import CreateDonation from '../pages/donor/CreateDonation';
import DonorRequests from '../pages/donor/DonorRequests';
import DonorAnalytics from '../pages/donor/DonorAnalytics';
import DonorProfile from '../pages/donor/DonorProfile';

// NGO Pages
import NgoDashboard from '../pages/ngo/NgoDashboard';
import AvailableFood from '../pages/ngo/AvailableFood';
import NearbyFoodMap from '../pages/ngo/NearbyFoodMap';
import NgoRequests from '../pages/ngo/NgoRequests';
import NgoAnalytics from '../pages/ngo/NgoAnalytics';
import NgoProfile from '../pages/ngo/NgoProfile';

// Volunteer Pages
import VolunteerDashboard from '../pages/volunteer/VolunteerDashboard';
import VolunteerTasks from '../pages/volunteer/VolunteerTasks';
import VolunteerProfile from '../pages/volunteer/VolunteerProfile';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminAnalytics from '../pages/admin/AdminAnalytics';
import AdminReports from '../pages/admin/AdminReports';
import AdminSettings from '../pages/admin/AdminSettings';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminNgos from '../pages/admin/AdminNgos';
import AdminDonations from '../pages/admin/AdminDonations';
import AdminRequests from '../pages/admin/AdminRequests';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/donations/:id" element={<DonationDetails />} />
        <Route path="/notifications" element={<NotificationCenter />} />
      </Route>

      {/* Donor Workspace (DashboardLayout) */}
      <Route
        path="/donor"
        element={
          <RoleProtectedRoute allowedRoles={['ROLE_DONOR']}>
            <DashboardLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/donor/dashboard" replace />} />
        <Route path="dashboard" element={<DonorDashboard />} />
        <Route path="donations" element={<MyDonations />} />
        <Route path="donations/create" element={<CreateDonation />} />
        <Route path="requests" element={<DonorRequests />} />
        <Route path="analytics" element={<DonorAnalytics />} />
        <Route path="profile" element={<DonorProfile />} />
      </Route>

      {/* NGO Workspace (DashboardLayout) */}
      <Route
        path="/ngo"
        element={
          <RoleProtectedRoute allowedRoles={['ROLE_NGO']}>
            <DashboardLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/ngo/dashboard" replace />} />
        <Route path="dashboard" element={<NgoDashboard />} />
        <Route path="nearby-food" element={<NearbyFoodMap />} />
        <Route path="donations" element={<AvailableFood />} />
        <Route path="requests" element={<NgoRequests />} />
        <Route path="analytics" element={<NgoAnalytics />} />
        <Route path="profile" element={<NgoProfile />} />
      </Route>

      {/* Volunteer Workspace (DashboardLayout) */}
      <Route
        path="/volunteer"
        element={
          <RoleProtectedRoute allowedRoles={['ROLE_VOLUNTEER']}>
            <DashboardLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/volunteer/dashboard" replace />} />
        <Route path="dashboard" element={<VolunteerDashboard />} />
        <Route path="tasks" element={<VolunteerTasks />} />
        <Route path="profile" element={<VolunteerProfile />} />
      </Route>

      {/* Admin Portal (DashboardLayout) */}
      <Route
        path="/admin"
        element={
          <RoleProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <DashboardLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="ngos" element={<AdminNgos />} />
        <Route path="donations" element={<AdminDonations />} />
        <Route path="requests" element={<AdminRequests />} />
      </Route>

      {/* 404 Catch-all */}
      <Route element={<MainLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
