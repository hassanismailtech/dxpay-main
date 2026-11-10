import { api } from '@/shared/api/axiosClient';
import { DashboardData } from '@/entities/transaction/model/types';

export const dashboardApi = {
  fetchDashboard: async (providerId: number): Promise<DashboardData> => {
    const response = await api.get('/api/dashboard', {
      params: { provider_id: providerId },
    });
    return response.data;
  },
};
