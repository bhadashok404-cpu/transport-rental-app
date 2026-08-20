import api from './api';

const userService = {
  getDirectory: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/users?${queryParams.toString()}`);
  },
};

export default userService;
