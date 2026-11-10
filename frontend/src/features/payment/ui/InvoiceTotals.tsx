import { CurrencyAmount } from '@/shared/ui/CurrencyAmount';

interface InvoiceTotalsProps {
  subtotal: number;
  total: number;
  className?: string;
}

export function InvoiceTotals({ subtotal, total, className }: InvoiceTotalsProps) {
  return (
    <div className={`bg-card p-6 rounded-lg border border-border mb-6 ${className || ''}`}>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Subtotal</span>
          <CurrencyAmount amount={subtotal} />
        </div>
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total Due</span>
          <CurrencyAmount amount={total} />
        </div>
      </div>
    </div>
  );
}
