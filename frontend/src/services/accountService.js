import api from './api';

const accountService = {
  getProfile: () => api.get('/account/profile'),
  updateProfile: (data) => api.put('/account/profile', data),
};

export default accountService;
