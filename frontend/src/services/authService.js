import api from './api';

const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  createAdmin: (data) => api.post('/auth/admin', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export default authService;