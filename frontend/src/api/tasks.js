import api from './axios.js';

export const getTasks = async (projectId) => {
  const res = await api.get('/tasks', { params: projectId ? { projectId } : {} });
  return res.data;
};

export const createTask = async (data) => {
  const res = await api.post('/tasks', data);
  return res.data;
};

export const updateTask = async (id, data) => {
  const res = await api.put(`/tasks/${id}`, data);
  return res.data;
};

export const deleteTask = async (id) => {
  const res = await api.delete(`/tasks/${id}`);
  return res.data;
};