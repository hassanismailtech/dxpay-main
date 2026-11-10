'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { paymentApi, type PaymentVerification } from '@/features/payment/api/paymentApi';
import { DownloadReceiptButton } from '@/features/payment/ui/DownloadReceiptButton';
import { Button } from '@/shared/ui/button';

export default function PaymentReturn() {
  const invoiceId = useParams<{ invoiceId: string }>()?.invoiceId || '';
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    payment: PaymentVerification | null;
    error: boolean;
  }>({ key: '', payment: null, error: false });
  const key = `${invoiceId}:${attempt}`;
  useEffect(() => {
    let active = true;
    // Callback query parameters are not evidence. Only the backend verifies Forge.
    paymentApi
      .verifyPayment(invoiceId)
      .then((payment) => {
        if (active) setResult({ key, payment, error: false });
      })
      .catch(() => {
        if (active) setResult({ key, payment: null, error: true });
      });
    return () => {
      active = false;
    };
  }, [invoiceId, key]);

  const checking = result.key !== key;
  const payment = checking ? null : result.payment;
  const verified =
    payment?.payment_status === 'successful' && payment.allocation_status === 'allocated';
  const message = checking
    ? 'Checking Forge for your payment status…'
    : result.error
      ? 'Verification is unavailable. No payment or allocation has been assumed. Check again without submitting another payment.'
      : verified
        ? 'Sandbox payment verified. Provider allocations have been recorded locally.'
        : `Payment status: ${payment?.payment_status || 'unconfirmed'}. No provider allocation has been assumed.`;

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 text-foreground">
      <Link href="/" className="font-semibold text-primary">
        DxPay
      </Link>
      <h1 className="mt-8 text-3xl font-semibold">Payment status</h1>
      <p className="mt-4 leading-relaxed" role="status" aria-live="polite">
        {message}
      </p>
      <p className="mt-4 break-all text-sm text-muted-foreground">Reference: {invoiceId}</p>
      <p className="mt-4 text-sm text-muted-foreground">
        Forge sandbox uses synthetic funds. Provider allocation is not real bank settlement.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {!verified && (
          <Button disabled={checking} onClick={() => setAttempt((value) => value + 1)}>
            Check again
          </Button>
        )}
        {verified && <DownloadReceiptButton verification={payment!} />}
        <Link
          className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring"
          href={`/pay/${encodeURIComponent(invoiceId)}`}
        >
          View invoice
        </Link>
      </div>
    </main>
  );
}
