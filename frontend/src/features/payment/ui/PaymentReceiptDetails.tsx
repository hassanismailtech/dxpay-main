import { CurrencyAmount } from '@/shared/ui/CurrencyAmount';
import { formatDateTime } from '@/shared/lib/utils';

interface PaymentReceiptDetailsProps {
  reference: string;
  amount: number;
  method: string;
  dateTime: string;
  className?: string;
}

export function PaymentReceiptDetails({
  reference,
  amount,
  method,
  dateTime,
  className,
}: PaymentReceiptDetailsProps) {
  return (
    <div className={`bg-card p-6 rounded-lg border border-border mb-6 ${className || ''}`}>
      <h2 className="text-lg font-semibold text-foreground mb-4">Sandbox payment details</h2>

      <div className="space-y-3">
        <div className="flex justify-between items-center gap-4 py-2 border-b border-border">
          <span className="text-muted-foreground">Reference</span>
          <span className="break-all font-medium text-foreground">{reference}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-muted-foreground">Amount paid</span>
          <CurrencyAmount amount={amount} />
        </div>

        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-muted-foreground">Payment method</span>
          <span className="font-medium text-foreground">{method}</span>
        </div>

        <div className="flex justify-between items-center py-2">
          <span className="text-muted-foreground">Date and time</span>
          <span className="font-medium text-foreground">{formatDateTime(dateTime)}</span>
        </div>
      </div>
    </div>
  );
}
