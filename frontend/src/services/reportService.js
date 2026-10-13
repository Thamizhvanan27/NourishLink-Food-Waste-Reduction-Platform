import api from './api';

const downloadBlob = (data, filename) => {
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const reportService = {
  downloadDonationsCsv: async (status = null, category = null) => {
    const params = {};
    if (status) params.status = status;
    if (category) params.category = category;

    const response = await api.get('/reports/donations/csv', {
      params,
      responseType: 'blob'
    });
    downloadBlob(response.data, `donations_report_${Date.now()}.csv`);
  },

  downloadDonationsPdf: async (status = null, category = null) => {
    const params = {};
    if (status) params.status = status;
    if (category) params.category = category;

    const response = await api.get('/reports/donations/pdf', {
      params,
      responseType: 'blob'
    });
    downloadBlob(response.data, `donations_report_${Date.now()}.pdf`);
  },

  downloadImpactPdf: async (year = null, month = null) => {
    const params = {};
    if (year) params.year = year;
    if (month) params.month = month;

    const response = await api.get('/reports/impact/pdf', {
      params,
      responseType: 'blob'
    });
    downloadBlob(response.data, `impact_report_${Date.now()}.pdf`);
  }
};

export default reportService;
