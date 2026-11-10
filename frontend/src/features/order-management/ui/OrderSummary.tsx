'use client';

import { useOrderStore } from '../model/useOrderStore';
import { CurrencyAmount } from '@/shared/ui/CurrencyAmount';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { ArrowUpRight, LoaderCircle, X } from 'lucide-react';

export const OrderSummary = () => {
  const {
    patientName,
    selectedTests,
    isGenerating,
    error,
    setPatientName,
    generateInvoice,
    reset,
    removeTest,
  } = useOrderStore();
  const total = selectedTests.reduce((sum, test) => sum + test.price, 0);
  return (
    <section
      aria-label="Order summary"
      className="rounded-lg border border-border bg-card p-5 text-foreground"
    >
      <h2 className="mb-5 text-base font-semibold">Order summary</h2>
      <label htmlFor="patient-name" className="mb-2 block text-sm font-medium">
        Patient reference
      </label>
      <Input
        id="patient-name"
        placeholder="e.g. DEMO-001"
        value={patientName}
        onChange={(event) => setPatientName(event.target.value)}
        disabled={isGenerating}
        aria-describedby="patient-help"
      />
      <p id="patient-help" className="mt-2 text-xs text-muted-foreground">
        Synthetic data only. Do not enter patient details.
      </p>
      <div className="my-6">
        <h3 className="mb-3 text-sm font-medium">Selected tests ({selectedTests.length})</h3>
        {selectedTests.length === 0 ? (
          <p className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
            Add a test to begin your order.
          </p>
        ) : (
          <ul className="space-y-3">
            {selectedTests.map((test) => (
              <li key={test.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0 flex-1">{test.name}</span>
                <CurrencyAmount
                  amount={test.price}
                  size="sm"
                  className="tabular-nums text-foreground"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove selected ${test.name}`}
                  onClick={() => removeTest(test.id)}
                  disabled={isGenerating}
                >
                  <X className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mb-5 flex items-center justify-between border-t border-border pt-5">
        <span className="text-sm font-medium">
          Total due <span className="text-muted-foreground">(NGN)</span>
        </span>
        <span data-testid="order-total">
          <CurrencyAmount amount={total} className="text-xl tabular-nums text-foreground" />
        </span>
      </div>
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      <Button
        onClick={generateInvoice}
        disabled={!patientName.trim() || !selectedTests.length || isGenerating}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isGenerating ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            Preparing checkout...
          </>
        ) : (
          <>
            Continue to secure checkout
            <ArrowUpRight className="size-4" />
          </>
        )}
      </Button>
      <Button
        variant="ghost"
        onClick={reset}
        disabled={isGenerating || (!patientName && !selectedTests.length)}
        className="mt-2 w-full"
      >
        Clear order
      </Button>
      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        Checkout opens with the payment provider. Creating a link does not confirm payment.
      </p>
    </section>
  );
};
