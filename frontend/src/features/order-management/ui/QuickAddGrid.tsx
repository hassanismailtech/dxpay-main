'use client';

import { DiagnosticTest } from '@/entities/test/model/types';
import { Plus, Check } from 'lucide-react';
import { CurrencyAmount } from '@/shared/ui/CurrencyAmount';
import { useOrderStore } from '../model/useOrderStore';

interface QuickAddGridProps {
  tests: DiagnosticTest[];
  onAddTest: (test: DiagnosticTest) => void;
}

export const QuickAddGrid = ({ tests, onAddTest }: QuickAddGridProps) => {
  const { selectedTests, isGenerating } = useOrderStore();
  return (
    <section aria-labelledby="quick-add-title">
      <h2 id="quick-add-title" className="mb-3 text-sm font-semibold text-foreground">
        Quick add
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tests.slice(0, 4).map((test) => {
          const selected = selectedTests.some((item) => item.id === test.id);
          const Icon = selected ? Check : Plus;
          return (
            <button
              key={test.id}
              type="button"
              aria-label={`Quick add ${test.name}`}
              disabled={selected || isGenerating}
              onClick={() => onAddTest(test)}
              className="flex min-h-20 items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-default disabled:bg-muted"
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{test.name}</span>
                <CurrencyAmount
                  amount={test.price}
                  size="sm"
                  className="text-muted-foreground tabular-nums"
                />
              </span>
              <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    </section>
  );
};
