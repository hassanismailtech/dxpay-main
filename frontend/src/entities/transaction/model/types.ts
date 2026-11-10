export interface PaymentSplit {
  provider: string;
  amount: number;
  type: 'lab' | 'imaging' | 'admin';
}

export interface Transaction {
  id: string;
  transaction_id?: string;
  patient_name: string;
  tests?: string[];
  amount: number;
  revenue_share?: number;
  status: 'Paid' | 'Awaiting' | 'Processing';
  time?: string;
  created_at?: string;
  splits?: PaymentSplit[];
}

export interface DashboardData {
  total_revenue: number;
  number_of_tests: number;
  transactions: Transaction[];
}
