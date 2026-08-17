import api from './api';

const couponService = {
  // Get all coupons
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/coupons?${queryParams.toString()}`);
  },

  // Get coupon by ID
  getById: (id) => api.get(`/coupons/${id}`),

  // Create coupon (admin)
  create: (couponData) => api.post('/coupons', couponData),

  // Get active coupons
  getActive: () => api.get('/coupons/active'),

  // Validate coupon
  validate: (code, orderAmount) => 
    api.post('/coupons/validate', { code, orderAmount }),

  // Get coupon by code
  getByCode: (code) => api.get(`/coupons/code/${code}`),

  // Delete coupon (admin)
  delete: (id) => api.delete(`/coupons/${id}`),
};

export default couponService;
