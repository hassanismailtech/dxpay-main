import { CurrencyAmount } from '@/shared/ui/CurrencyAmount';

interface InvoiceLineItemsProps {
  tests: Array<{
    name: string;
    price: number;
  }>;
  className?: string;
}

export function InvoiceLineItems({ tests, className }: InvoiceLineItemsProps) {
  return (
    <div className={`bg-card rounded-lg border border-border mb-6 ${className || ''}`}>
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-card-foreground">Diagnostic tests</h2>
      </div>

      <div className="divide-y divide-border">
        {tests.map((test, index) => (
          <div key={index} className="px-6 py-4 flex justify-between items-center">
            <div>
              <p className="font-medium text-foreground">{test.name}</p>
            </div>
            <CurrencyAmount amount={test.price} />
          </div>
        ))}
      </div>
    </div>
  );
}
