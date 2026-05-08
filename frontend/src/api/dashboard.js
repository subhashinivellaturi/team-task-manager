import api from './axios.js';

export const getDashboard = async () => {
  const res = await api.get('/dashboard');
  return res.data;
};