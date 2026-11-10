import { create } from 'zustand';
import { Order } from '@/entities/order/model/types';

const unavailable =
  'Fulfillment is not connected. No backend queue or status-update endpoint is available.';
interface FulfillmentState {
  orders: Order[];
  activeDepartment: 'hematology' | 'mri' | 'imaging';
  activeFilter: 'queue' | 'history';
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  setDepartment: (department: FulfillmentState['activeDepartment']) => void;
  setFilter: (filter: FulfillmentState['activeFilter']) => void;
  setSearch: (query: string) => void;
  startTest: (orderId: string) => Promise<void>;
  markSample: (orderId: string) => Promise<void>;
  completeOrder: (orderId: string) => Promise<void>;
}

export const useFulfillmentStore = create<FulfillmentState>((set) => ({
  orders: [],
  activeDepartment: 'hematology',
  activeFilter: 'queue',
  searchQuery: '',
  isLoading: false,
  error: unavailable,
  setDepartment: (activeDepartment) => set({ activeDepartment }),
  setFilter: (activeFilter) => set({ activeFilter }),
  setSearch: (searchQuery) => set({ searchQuery }),
  startTest: async () => {
    set({ error: unavailable });
  },
  markSample: async () => {
    set({ error: unavailable });
  },
  completeOrder: async () => {
    set({ error: unavailable });
  },
}));
