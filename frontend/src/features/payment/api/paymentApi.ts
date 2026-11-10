import { api } from '@/shared/api/axiosClient';

export type PaymentStatus =
  'pending' | 'successful' | 'failed' | 'partial' | 'overpaid' | 'reversed';

export interface PaymentVerification {
  reference: string;
  amount: number;
  currency: 'NGN';
  payment_status: PaymentStatus;
  allocation_status?: 'allocated';
}

export const paymentApi = {
  getInvoice: async (reference: string): Promise<import('../model/usePaymentStore').Invoice> => {
    const response = await api.get(`/api/invoices/${encodeURIComponent(reference)}`);
    return response.data;
  },
  verifyPayment: async (txRef: string): Promise<PaymentVerification> => {
    const response = await api.get('/api/payment/verify', {
      params: { transaction_reference: txRef },
    });
    return response.data;
  },
};
