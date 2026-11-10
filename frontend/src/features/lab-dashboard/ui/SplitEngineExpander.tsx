import { PaymentSplit } from '@/entities/transaction/model/types';
import { CurrencyAmount } from '@/shared/ui/CurrencyAmount';

export const SplitEngineExpander = ({ splits }: { splits: PaymentSplit[] }) => (
  <div className="bg-muted p-5">
    <h3 className="mb-3 text-sm font-semibold">Provider allocation details</h3>
    <div className="space-y-3">
      {splits.map((split, index) => (
        <div key={`${split.provider}-${index}`} className="flex items-center justify-between gap-4">
          <span>
            {split.provider}
            <span className="ml-2 text-xs text-muted-foreground">{split.type}</span>
          </span>
          <CurrencyAmount amount={split.amount} size="sm" />
        </div>
      ))}
    </div>
    <p className="mt-4 text-xs text-muted-foreground">
      Internal allocations only. Bank settlement is not connected.
    </p>
  </div>
);
