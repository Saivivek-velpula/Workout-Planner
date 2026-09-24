import api from './client';

export const statsApi = {
  getWeeklyStats: () => api.get('/stats/weekly')
};
