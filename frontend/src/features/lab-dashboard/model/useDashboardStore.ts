import { create } from 'zustand';
import { Transaction } from '@/entities/transaction/model/types';
import { dashboardApi } from '../api/dashboardApi';

interface DashboardState {
  stats: { totalRevenue: number; activeOrders: number } | null;
  transactions: Transaction[];
  expandedTxnId: string | null;
  isLoading: boolean;
  error: string | null;
  fetchData: (providerId: number) => Promise<void>;
  toggleExpand: (id: string) => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: null,
  transactions: [],
  expandedTxnId: null,
  isLoading: true,
  error: null,
  fetchData: async (providerId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await dashboardApi.fetchDashboard(providerId);
      set({
        stats: {
          totalRevenue: Number(data.total_revenue),
          activeOrders: Number(data.number_of_tests),
        },
        transactions: data.transactions.map((transaction) => ({
          ...transaction,
          id: transaction.transaction_id || transaction.id,
          amount: Number(transaction.revenue_share ?? transaction.amount),
          status: 'Paid',
          time: transaction.created_at,
        })),
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unable to load payment data.',
        isLoading: false,
      });
    }
  },
  toggleExpand: (id) => set({ expandedTxnId: get().expandedTxnId === id ? null : id }),
}));
