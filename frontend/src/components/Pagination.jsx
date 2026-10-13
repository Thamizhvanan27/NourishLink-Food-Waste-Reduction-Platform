import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange, totalElements }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mt-4 gap-3">
      {totalElements !== undefined && (
        <span className="small text-muted">
          Showing page <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong> ({totalElements} items total)
        </span>
      )}

      <ul className="pagination pagination-sm mb-0">
        <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            aria-label="Previous"
          >
            <i className="bi bi-chevron-left"></i> Previous
          </button>
        </li>

        {[...Array(totalPages)].map((_, idx) => {
          // Show at most 5 pages around current
          if (idx === 0 || idx === totalPages - 1 || (idx >= currentPage - 2 && idx <= currentPage + 2)) {
            return (
              <li key={idx} className={`page-item ${currentPage === idx ? 'active' : ''}`}>
                <button className="page-link" onClick={() => onPageChange(idx)}>
                  {idx + 1}
                </button>
              </li>
            );
          } else if (idx === currentPage - 3 || idx === currentPage + 3) {
            return (
              <li key={idx} className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            );
          }
          return null;
        })}

        <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            aria-label="Next"
          >
            Next <i className="bi bi-chevron-right"></i>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Pagination;
