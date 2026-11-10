import type { DiagnosticTest } from '@/entities/test/model/types';

export type OrderStatus =
  'pending' | 'paid' | 'ready_to_process' | 'processing' | 'sample_collected' | 'completed';

export interface Order {
  id: string;
  patient_name: string;
  tests: DiagnosticTest[];
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  time_elapsed?: string;
}
