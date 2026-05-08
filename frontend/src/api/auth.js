import api from './axios.js';

export const signupApi = async (data) => {
  const res = await api.post('/auth/signup', data);
  return res.data;
};

export const loginApi = async (data) => {
  const res = await api.post('/auth/login', data);
  return res.data;
};