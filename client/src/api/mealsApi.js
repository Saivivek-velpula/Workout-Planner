import api from './client';

export const mealsApi = {
  getAll: (params) => api.get('/meals', { params }),
  getById: (id) => api.get(`/meals/${id}`),
  create: (mealData) => api.post('/meals', mealData),
  update: (id, mealData) => api.put(`/meals/${id}`, mealData),
  delete: (id) => api.delete(`/meals/${id}`)
};
