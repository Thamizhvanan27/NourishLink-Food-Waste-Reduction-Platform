import React from 'react';

const StatusBadge = ({ status }) => {
  const getIcon = (st) => {
    switch (st) {
      case 'AVAILABLE': return 'bi-check-circle-fill';
      case 'REQUESTED': return 'bi-hourglass-split';
      case 'ACCEPTED': return 'bi-check-all';
      case 'PICKED_UP': return 'bi-truck';
      case 'COMPLETED': return 'bi-award-fill';
      case 'EXPIRED': return 'bi-clock-history';
      case 'CANCELLED': return 'bi-x-circle-fill';
      case 'PENDING': return 'bi-hourglass';
      case 'REJECTED': return 'bi-slash-circle';
      default: return 'bi-dot';
    }
  };

  const formatText = (st) => {
    if (!st) return 'UNKNOWN';
    return st.replace(/_/g, ' ');
  };

  return (
    <span className={`badge-status badge-${status}`}>
      <i className={`bi ${getIcon(status)}`}></i>
      {formatText(status)}
    </span>
  );
};

export default StatusBadge;
