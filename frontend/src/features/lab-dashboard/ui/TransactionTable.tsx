import Link from 'next/link';
import { Transaction } from '@/entities/transaction/model/types';
import { TransactionTableRow } from './TransactionTableRow';
import { cn } from '@/shared/lib/utils';

interface TransactionTableProps {
  transactions?: Transaction[];
  expandedTxnId: string | null;
  onToggleExpand: (id: string) => void;
  className?: string;
}

export const TransactionTable = ({
  transactions = [],
  expandedTxnId,
  onToggleExpand,
  className,
}: TransactionTableProps) => (
  <section aria-label="Transaction ledger" className={cn('ledger', className)}>
    <div className="ledger-header">
      <div>
        <h2>Transaction ledger</h2>
        <p>Verified payments · {transactions.length.toLocaleString('en-NG')} transactions</p>
      </div>
      <span className="text-xs text-muted-foreground">NGN</span>
    </div>
    {transactions.length ? (
      <table className="ledger-table">
        <thead>
          <tr>
            <th scope="col">Patient / reference</th>
            <th scope="col" className="numeric">
              Provider share
            </th>
            <th scope="col">Payment</th>
            <th scope="col">Recorded</th>
            <th scope="col">
              <span className="sr-only">Allocations</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <TransactionTableRow
              key={transaction.id}
              transaction={transaction}
              isExpanded={expandedTxnId === transaction.id}
              onToggleExpand={() => onToggleExpand(transaction.id)}
            />
          ))}
        </tbody>
      </table>
    ) : (
      <div className="ledger-empty">
        <p>
          No verified payments yet. Your provider’s transactions will appear here after payment
          verification.
        </p>
        <Link href="/terminal" className="font-semibold text-foreground">
          Create your first order →
        </Link>
      </div>
    )}
  </section>
);
