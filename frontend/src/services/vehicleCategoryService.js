import api from './api';

const vehicleCategoryService = {
  // Get all categories
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/vehicle-categories?${queryParams.toString()}`);
  },

  // Get category by ID
  getById: (id) => api.get(`/vehicle-categories/${id}`),

  // Get active categories
  getActive: () => api.get('/vehicle-categories/active'),

  // Create category (admin)
  create: (categoryData) => api.post('/vehicle-categories', categoryData),

  // Update category (admin)
  update: (id, categoryData) => api.put(`/vehicle-categories/${id}`, categoryData),

  // Delete category (admin)
  delete: (id) => api.delete(`/vehicle-categories/${id}`),
};

export default vehicleCategoryService;
