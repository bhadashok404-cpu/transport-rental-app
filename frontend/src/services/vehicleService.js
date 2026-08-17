import api from './api';

const vehicleService = {
  // Get all vehicles with pagination and filters
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber);
    if (params.pageSize) queryParams.append('pageSize', params.pageSize);
    if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    if (params.vehicleType) queryParams.append('vehicleType', params.vehicleType);
    if (params.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice);
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
    if (params.isAvailable !== undefined) queryParams.append('isAvailable', params.isAvailable);
    
    return api.get(`/vehicles?${queryParams.toString()}`);
  },

  // Get vehicle by ID
  getById: (id) => api.get(`/vehicles/${id}`),

  // Get available vehicles
  getAvailable: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/vehicles/available?${queryParams.toString()}`);
  },

  // Search vehicles
  search: (searchTerm, params = {}) => {
    const queryParams = new URLSearchParams({ ...params, searchTerm });
    return api.get(`/vehicles/search?${queryParams.toString()}`);
  },

  // Get vehicles by category
  getByCategory: (categoryId, params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/vehicles/category/${categoryId}?${queryParams.toString()}`);
  },

  // Create vehicle (admin)
  create: (vehicleData) => api.post('/vehicles', vehicleData),

  // Update vehicle (admin)
  update: (id, vehicleData) => api.put(`/vehicles/${id}`, vehicleData),

  // Delete vehicle (admin)
  delete: (id) => api.delete(`/vehicles/${id}`),

  // Update vehicle availability
  updateAvailability: (id, isAvailable) => 
    api.patch(`/vehicles/${id}/availability`, { isAvailable }),
};

export default vehicleService;
