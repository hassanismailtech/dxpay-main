'use client';

import { Transaction } from '@/entities/transaction/model/types';
import { CurrencyAmount } from '@/shared/ui/CurrencyAmount';
import { formatDateTime } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { SplitEngineExpander } from './SplitEngineExpander';

interface TransactionTableRowProps {
  transaction: Transaction;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const TransactionTableRow = ({
  transaction,
  isExpanded,
  onToggleExpand,
}: TransactionTableRowProps) => {
  const hasSplits = Boolean(transaction.splits?.length);
  const date = transaction.time || transaction.created_at;
  return (
    <>
      <tr>
        <td>
          <span>{transaction.patient_name}</span>
          <small>{transaction.id}</small>
          {transaction.tests?.length ? <small>{transaction.tests.join(', ')}</small> : null}
        </td>
        <td className="numeric">
          <CurrencyAmount amount={transaction.amount} size="sm" />
        </td>
        <td>
          <span
            className={`status-badge ${transaction.status === 'Paid' ? 'status-positive' : 'status-neutral'}`}
          >
            {transaction.status === 'Paid' ? 'Verified' : transaction.status}
          </span>
        </td>
        <td>{date ? formatDateTime(date) : '—'}</td>
        <td>
          {hasSplits && (
            <Button
              variant="ghost"
              size="sm"
              aria-expanded={isExpanded}
              aria-label={`Provider allocations for ${transaction.id}`}
              onClick={onToggleExpand}
            >
              {isExpanded ? 'Hide shares' : 'View shares'}
            </Button>
          )}
        </td>
      </tr>
      {isExpanded && hasSplits && (
        <tr className="split-row">
          <td colSpan={5}>
            <SplitEngineExpander splits={transaction.splits!} />
          </td>
        </tr>
      )}
    </>
  );
};
