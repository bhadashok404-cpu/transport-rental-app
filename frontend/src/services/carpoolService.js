import api from './api';

const carpoolService = {
  // ── Ride Offers ─────────────────────────────────────────────────────────────

  /** Search available rides. Public — no auth needed.
   *  @param {object} params { originCity, destinationCity, date (YYYY-MM-DD), passengers, maxPricePerSeat?, instantBookingOnly?, sortBy? }
   */
  searchRides: (params = {}) => {
    const q = new URLSearchParams();
    if (params.originCity)        q.set('originCity',       params.originCity);
    if (params.destinationCity)   q.set('destinationCity',  params.destinationCity);
    if (params.date)              q.set('date',             params.date);
    if (params.passengers)        q.set('passengers',       params.passengers);
    if (params.maxPricePerSeat)   q.set('maxPricePerSeat',  params.maxPricePerSeat);
    if (params.instantBookingOnly != null) q.set('instantBookingOnly', params.instantBookingOnly);
    if (params.sortBy != null)    q.set('sortBy',           params.sortBy);
    return api.get(`/ride-offers/search?${q.toString()}`);
  },

  /** Get a single ride offer with full passenger list. Public. */
  getRideById: (id) => api.get(`/ride-offers/${id}`),

  /** Driver creates a new ride offer. Requires Driver JWT. */
  createRide: (rideData) => api.post('/ride-offers', rideData),

  /** All offers posted by a driver. */
  getDriverRides: (driverId) => api.get(`/ride-offers/driver/${driverId}`),

  /** Cancel a ride offer (driver or admin). */
  cancelRide: (id) => api.patch(`/ride-offers/${id}/cancel`),

  /** Mark a ride offer as completed (driver or admin). */
  completeRide: (id) => api.patch(`/ride-offers/${id}/complete`),

  // ── Carpool Bookings ────────────────────────────────────────────────────────

  /** Passenger books a seat. Requires Customer JWT.
   *  @param {object} data { rideOfferId, seatsBooked, paymentMethod }
   */
  bookSeat: (data) => api.post('/carpool-bookings', data),

  /** Passenger's own booking list. */
  getMyBookings: () => api.get('/carpool-bookings/my'),

  /** Get single carpool booking by id. */
  getBookingById: (id) => api.get(`/carpool-bookings/${id}`),

  /** Confirm a pending carpool booking (driver/admin approval flow). */
  confirmBooking: (id) => api.patch(`/carpool-bookings/${id}/confirm`),

  /** Cancel a carpool booking (customer or admin). */
  cancelBooking: (id) => api.patch(`/carpool-bookings/${id}/cancel`),

  /** Admin — bookings for any customer. */
  getBookingsByCustomer: (customerId) => api.get(`/carpool-bookings/customer/${customerId}`),

  /** Admin — all ride offers (all drivers, all statuses). */
  getAllRideOffers: (params = {}) => {
    const q = new URLSearchParams();
    if (params.pageSize) q.set('pageSize', params.pageSize);
    if (params.page)     q.set('page', params.page);
    return api.get(`/ride-offers?${q.toString()}`);
  },
};

export default carpoolService;
