import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="py-5 text-center my-auto">
      <div className="container py-5">
        <div style={{ fontSize: '4rem' }}>🌱</div>
        <h1 className="display-4 fw-bold font-heading mt-3">404 - Page Not Found</h1>
        <p className="lead text-muted max-w-500 mx-auto mb-4">
          The page or donation resource you requested does not exist or has been relocated.
        </p>
        <Link to="/" className="btn btn-primary-custom px-4 py-2">
          <i className="bi bi-house-door me-1"></i> Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
