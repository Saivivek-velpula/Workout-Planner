import api from './client';

export const entriesApi = {
  getAll: (params) => api.get('/entries', { params }),
  getByDate: (date) => api.get(`/entries/${date}`),
  saveDailyEntry: (entryData) => api.post('/entries', entryData),
  updateById: (id, entryData) => api.put(`/entries/${id}`, entryData),
  deleteById: (id) => api.delete(`/entries/${id}`)
};
