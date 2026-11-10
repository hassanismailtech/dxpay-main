import { api } from '@/shared/api/axiosClient';
import { Order } from '@/entities/order/model/types';

export const orderApi = {
  createOrder: async (patientName: string, testIds: number[]): Promise<Order> => {
    const response = await api.post('/api/orders', {
      patient_name: patientName,
      test_ids: testIds,
    });
    return response.data;
  },

  generateInvoice: async (orderId: string): Promise<{ payment_link: string }> => {
    const response = await api.post('/api/invoices', {
      order_id: orderId,
    });
    return response.data;
  },
};
