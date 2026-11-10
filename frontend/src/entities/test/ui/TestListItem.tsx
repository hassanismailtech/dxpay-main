'use client';

import { DiagnosticTest } from '../model/types';
import { CurrencyAmount } from '@/shared/ui/CurrencyAmount';
import { Button } from '@/shared/ui/button';

interface TestListItemProps {
  test: DiagnosticTest;
  isSelected?: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
}

export const TestListItem = ({
  test,
  isSelected,
  onAdd,
  onRemove,
  disabled,
}: TestListItemProps) => (
  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 last:border-0">
    <div className="min-w-0 flex-1">
      <h3 className="text-sm font-medium text-foreground">{test.name}</h3>
      {test.category && (
        <p className="mt-1 text-xs capitalize text-muted-foreground">{test.category}</p>
      )}
    </div>
    <CurrencyAmount amount={test.price} size="sm" className="tabular-nums text-foreground" />
    <Button
      variant="outline"
      size="sm"
      aria-label={`${isSelected ? 'Remove' : 'Add'} ${test.name}`}
      disabled={disabled}
      onClick={isSelected ? onRemove : onAdd}
    >
      {isSelected ? 'Remove' : 'Add'}
    </Button>
  </div>
);
