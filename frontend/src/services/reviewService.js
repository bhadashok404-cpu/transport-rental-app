import api from './api';

const reviewService = {
  // Get all reviews
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/reviews?${queryParams.toString()}`);
  },

  // Get review by ID
  getById: (id) => api.get(`/reviews/${id}`),

  // Create review
  create: (reviewData) => api.post('/reviews', reviewData),

  // Get reviews by booking
  getByBooking: (bookingId) => api.get(`/reviews/booking/${bookingId}`),

  // Get reviews by customer
  getByCustomer: (customerId, params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/reviews/customer/${customerId}?${queryParams.toString()}`);
  },

  // Get reviews by driver
  getByDriver: (driverId, params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/reviews/driver/${driverId}?${queryParams.toString()}`);
  },

  // Get reviews by vehicle
  getByVehicle: (vehicleId, params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/reviews/vehicle/${vehicleId}?${queryParams.toString()}`);
  },

  // Get reviews by rating
  getByRating: (rating, params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/reviews/rating/${rating}?${queryParams.toString()}`);
  },
};

export default reviewService;
