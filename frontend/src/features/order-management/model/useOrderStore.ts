import { create } from 'zustand';
import { DiagnosticTest } from '@/entities/test/model/types';
import { api } from '@/shared/api/axiosClient';
import { orderApi } from '../api/orderApi';

interface OrderState {
  patientName: string;
  selectedTests: DiagnosticTest[];
  orderId: string | null;
  paymentLink: string | null;
  isGenerating: boolean;
  error: string | null;
  availableTests: DiagnosticTest[];
  catalogStatus: 'idle' | 'loading' | 'ready' | 'error';
  catalogError: string | null;
  loadCatalog: () => Promise<void>;
  setPatientName: (name: string) => void;
  addTest: (test: DiagnosticTest) => void;
  removeTest: (id: number) => void;
  generateInvoice: () => Promise<void>;
  reset: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  patientName: '',
  selectedTests: [],
  orderId: null,
  paymentLink: null,
  isGenerating: false,
  error: null,
  availableTests: [],
  catalogStatus: 'idle',
  catalogError: null,
  loadCatalog: async () => {
    if (get().catalogStatus === 'loading') return;
    set({ catalogStatus: 'loading', catalogError: null });
    try {
      const { data } = await api.get<DiagnosticTest[]>('/api/tests');
      if (
        !Array.isArray(data) ||
        !data.every(
          (test) =>
            Number.isInteger(test.id) &&
            typeof test.name === 'string' &&
            typeof test.price === 'number' &&
            Number.isFinite(test.price) &&
            test.price >= 0,
        )
      ) {
        throw new Error('The test catalogue could not be read. Please try again.');
      }
      set({ availableTests: data, catalogStatus: 'ready' });
    } catch (error) {
      set({
        catalogStatus: 'error',
        catalogError: error instanceof Error ? error.message : 'Unable to load the test catalogue.',
      });
    }
  },
  setPatientName: (patientName) => {
    if (!get().isGenerating) set({ patientName, error: null, orderId: null, paymentLink: null });
  },
  addTest: (test) => {
    if (get().isGenerating || get().selectedTests.some((item) => item.id === test.id)) return;
    set({
      selectedTests: [...get().selectedTests, test],
      error: null,
      orderId: null,
      paymentLink: null,
    });
  },
  removeTest: (id) => {
    if (!get().isGenerating)
      set({
        selectedTests: get().selectedTests.filter((test) => test.id !== id),
        orderId: null,
        paymentLink: null,
      });
  },
  generateInvoice: async () => {
    const { patientName, selectedTests, isGenerating } = get();
    if (isGenerating) return;
    if (!patientName.trim() || !selectedTests.length) {
      set({ error: 'Patient reference and at least one test are required.' });
      return;
    }
    set({ isGenerating: true, error: null });
    try {
      const orderId =
        get().orderId ??
        (
          await orderApi.createOrder(
            patientName.trim(),
            selectedTests.map((test) => test.id),
          )
        ).id;
      set({ orderId });
      const invoice = await orderApi.generateInvoice(orderId);
      const paymentUrl = new URL(invoice.payment_link);
      if (paymentUrl.protocol !== 'https:')
        throw new Error('The checkout link is invalid. Please try again.');
      set({ paymentLink: paymentUrl.href, isGenerating: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Unable to prepare checkout. Please try again.',
        isGenerating: false,
      });
    }
  },
  reset: () => {
    if (!get().isGenerating)
      set({ patientName: '', selectedTests: [], orderId: null, paymentLink: null, error: null });
  },
}));
