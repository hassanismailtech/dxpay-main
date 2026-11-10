'use client';

import { Button } from '@/shared/ui/button';
import { CurrencyAmount } from '@/shared/ui/CurrencyAmount';

interface PayButtonProps {
  invoiceId: string;
  amount: number;
  paymentLink: string | null;
  className?: string;
}

export const PayButton = ({ amount, paymentLink, className = '' }: PayButtonProps) => {
  let available = false;
  try {
    const url = new URL(paymentLink || '');
    available =
      url.protocol === 'https:' &&
      url.hostname === 'pay.xtradot.co' &&
      !url.username &&
      !url.password &&
      !url.port &&
      /^\/pay\/[^/]+$/.test(url.pathname);
  } catch {
    /* An unavailable checkout must never become a payment action. */
  }

  if (!available)
    return (
      <Button disabled className={`w-full ${className}`}>
        Checkout unavailable
      </Button>
    );

  return (
    <a
      href={paymentLink!}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${className}`}
    >
      Pay <CurrencyAmount amount={amount} className="text-primary-foreground" />
    </a>
  );
};
