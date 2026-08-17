import api from './api';

const bookingService = {
  // Get all bookings with pagination
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/bookings?${queryParams.toString()}`);
  },

  // Get booking by ID
  getById: (id) => api.get(`/bookings/${id}`),

  // Create booking
  create: (bookingData) => api.post('/bookings', bookingData),

  // Update booking
  update: (id, bookingData) => api.put(`/bookings/${id}`, bookingData),

  // Cancel booking
  cancel: (id, reason) => api.post(`/bookings/${id}/cancel`, { reason }),

  // Assign driver to booking
  assignDriver: (id, driverId) => api.post(`/bookings/${id}/assign-driver`, { driverId }),

  // Get customer bookings
  getByCustomer: (customerId, params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/bookings/customer/${customerId}?${queryParams.toString()}`);
  },

  // Get driver bookings
  getByDriver: (driverId, params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/bookings/driver/${driverId}?${queryParams.toString()}`);
  },

  // Get bookings by status
  getByStatus: (status, params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/bookings/status/${status}?${queryParams.toString()}`);
  },

  // Complete booking
  complete: (id) => api.post(`/bookings/${id}/complete`),

  // Start trip
  startTrip: (id) => api.post(`/bookings/${id}/start`),
};

export default bookingService;
