import api from './api';

const paymentService = {
  // Get all payments
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/payments?${queryParams.toString()}`);
  },

  // Get payment by ID
  getById: (id) => api.get(`/payments/${id}`),

  // Create payment
  create: (paymentData) => api.post('/payments', paymentData),

  // Process payment
  process: (id, paymentDetails) => api.post(`/payments/${id}/process`, paymentDetails),

  // Get payments by booking
  getByBooking: (bookingId) => api.get(`/payments/booking/${bookingId}`),

  // Get customer payments
  getByCustomer: (customerId, params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/payments/customer/${customerId}?${queryParams.toString()}`);
  },

  // Get payments by status
  getByStatus: (status, params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/payments/status/${status}?${queryParams.toString()}`);
  },

  // Refund payment
  refund: (id, amount) => api.post(`/payments/${id}/refund`, { amount }),
};

export default paymentService;
