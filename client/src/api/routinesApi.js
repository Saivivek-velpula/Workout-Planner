import api from './client';

export const routinesApi = {
  getAll: (params) => api.get('/routines', { params }),
  getById: (id) => api.get(`/routines/${id}`),
  create: (routineData) => api.post('/routines', routineData),
  update: (id, routineData) => api.put(`/routines/${id}`, routineData),
  delete: (id) => api.delete(`/routines/${id}`)
};
