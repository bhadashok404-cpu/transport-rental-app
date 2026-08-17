import api from './api';

const driverService = {
  // Get all drivers
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/drivers?${queryParams.toString()}`);
  },

  // Get driver by ID
  getById: (id) => api.get(`/drivers/${id}`),

  // Create driver
  create: (driverData) => api.post('/drivers', driverData),

  // Update driver
  update: (id, driverData) => api.put(`/drivers/${id}`, driverData),

  // Delete driver
  delete: (id) => api.delete(`/drivers/${id}`),

  // Get available drivers
  getAvailable: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/drivers/available?${queryParams.toString()}`);
  },

  // Get drivers by status
  getByStatus: (status, params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/drivers/status/${status}?${queryParams.toString()}`);
  },

  // Update driver status
  updateStatus: (id, status) => api.patch(`/drivers/${id}/status`, { status }),

  // Get driver statistics
  getStats: (id) => api.get(`/drivers/${id}/stats`),

  // Get top rated drivers
  getTopRated: (count = 10) => api.get(`/drivers/top-rated?count=${count}`),
};

export default driverService;
