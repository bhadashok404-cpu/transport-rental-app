import api from './api';

const notificationService = {
  // Get all notifications
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/notifications?${queryParams.toString()}`);
  },

  // Get notification by ID
  getById: (id) => api.get(`/notifications/${id}`),

  // Create notification
  create: (notificationData) => api.post('/notifications', notificationData),

  // Get customer notifications
  getByCustomer: (customerId, params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/notifications/customer/${customerId}?${queryParams.toString()}`);
  },

  // Get unread notifications
  getUnread: (customerId) => api.get(`/notifications/customer/${customerId}/unread`),

  // Mark notification as read
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),

  // Mark all as read for customer
  markAllAsRead: (customerId) => api.post(`/notifications/customer/${customerId}/mark-all-read`),

  // Delete notification
  delete: (id) => api.delete(`/notifications/${id}`),

  // Get notification count
  getUnreadCount: (customerId) => api.get(`/notifications/customer/${customerId}/unread-count`),
};

export default notificationService;
