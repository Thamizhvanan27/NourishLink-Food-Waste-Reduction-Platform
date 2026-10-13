import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DashboardSidebar from '../components/DashboardSidebar';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const { role } = useAuth();

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <div className="container-fluid flex-grow-1 p-0">
        <div className="d-flex">
          <DashboardSidebar />

          <main className="flex-grow-1 p-3 p-md-4 p-xl-5 bg-light" style={{ minWidth: 0 }}>
            {/* Mobile horizontal navigation for smaller screens */}
            <div className="d-lg-none mb-3 overflow-auto pb-2">
              <div className="d-flex gap-2">
                {role === 'ROLE_DONOR' && (
                  <>
                    <NavLink to="/donor/dashboard" end className="btn btn-sm btn-outline-secondary text-nowrap">Dashboard</NavLink>
                    <NavLink to="/donor/donations" className="btn btn-sm btn-outline-secondary text-nowrap">My Donations</NavLink>
                    <NavLink to="/donor/donations/create" className="btn btn-sm btn-outline-success text-nowrap">+ Donate</NavLink>
                    <NavLink to="/donor/requests" className="btn btn-sm btn-outline-secondary text-nowrap">Requests</NavLink>
                    <NavLink to="/donor/profile" className="btn btn-sm btn-outline-secondary text-nowrap">Profile</NavLink>
                  </>
                )}
                {role === 'ROLE_NGO' && (
                  <>
                    <NavLink to="/ngo/dashboard" end className="btn btn-sm btn-outline-secondary text-nowrap">Dashboard</NavLink>
                    <NavLink to="/ngo/donations" className="btn btn-sm btn-outline-success text-nowrap">Browse Food</NavLink>
                    <NavLink to="/ngo/requests" className="btn btn-sm btn-outline-secondary text-nowrap">My Requests</NavLink>
                    <NavLink to="/ngo/profile" className="btn btn-sm btn-outline-secondary text-nowrap">Profile</NavLink>
                  </>
                )}
                {role === 'ROLE_ADMIN' && (
                  <>
                    <NavLink to="/admin/dashboard" end className="btn btn-sm btn-outline-secondary text-nowrap">Overview</NavLink>
                    <NavLink to="/admin/users" className="btn btn-sm btn-outline-secondary text-nowrap">Users</NavLink>
                    <NavLink to="/admin/ngos" className="btn btn-sm btn-outline-secondary text-nowrap">NGOs</NavLink>
                    <NavLink to="/admin/donations" className="btn btn-sm btn-outline-secondary text-nowrap">Donations</NavLink>
                    <NavLink to="/admin/requests" className="btn btn-sm btn-outline-secondary text-nowrap">Requests</NavLink>
                  </>
                )}
              </div>
            </div>

            <div className="container-xl p-0">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardLayout;
