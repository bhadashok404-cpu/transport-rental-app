import api from './api';

const customerService = {
  // Get all customers
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/customers?${queryParams.toString()}`);
  },

  // Get customer by ID
  getById: (id) => api.get(`/customers/${id}`),

  // Create customer (register)
  create: (customerData) => api.post('/customers', customerData),

  // Update customer
  update: (id, customerData) => api.put(`/customers/${id}`, customerData),

  // Delete customer
  delete: (id) => api.delete(`/customers/${id}`),

  // Get customer by email (matches backend route: GET api/customers/by-email/{email})
  getByEmail: (email) => api.get(`/customers/by-email/${email}`),

  // Verify customer (backend expects PATCH api/customers/{id}/verify)
  verify: (id) => api.patch(`/customers/${id}/verify`),

  // Get customer statistics
  getStats: (id) => api.get(`/customers/${id}/stats`),
};

export default customerService;
