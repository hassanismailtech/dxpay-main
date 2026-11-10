'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { InvoiceHeader } from '@/features/payment/ui/InvoiceHeader';
import { InvoicePatientInfo } from '@/features/payment/ui/InvoicePatientInfo';
import { InvoiceLineItems } from '@/features/payment/ui/InvoiceLineItems';
import { InvoiceTotals } from '@/features/payment/ui/InvoiceTotals';
import { PayButton } from '@/features/payment/ui/PayButton';
import type { Invoice } from '@/features/payment/model/usePaymentStore';
import { paymentApi } from '@/features/payment/api/paymentApi';
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';
import { EmptyState } from '@/shared/ui/EmptyState';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function InvoicePage() {
  const params = useParams();
  const invoiceId = params?.invoiceId as string;

  const [result, setResult] = useState<{
    reference: string;
    invoice: Invoice | null;
    error: string | null;
  }>({ reference: '', invoice: null, error: null });
  useEffect(() => {
    let active = true;
    paymentApi
      .getInvoice(invoiceId)
      .then((invoice) => {
        if (active) setResult({ reference: invoiceId, invoice, error: null });
      })
      .catch((error) => {
        if (active)
          setResult({
            reference: invoiceId,
            invoice: null,
            error: error instanceof Error ? error.message : 'Unable to load invoice.',
          });
      });
    return () => {
      active = false;
    };
  }, [invoiceId]);
  const { invoice, error } = result;

  if (result.reference !== invoiceId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <EmptyState
          title="Invoice not found"
          description={error || "The invoice you're looking for doesn't exist or has been removed."}
          icon={<AlertCircle className="h-12 w-12 text-destructive" />}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <InvoiceHeader invoiceNumber={invoice.invoice_number} />

        <InvoicePatientInfo
          patientName={invoice.patient_name}
          providerName={invoice.provider_name}
          date={invoice.date}
        />

        <InvoiceLineItems tests={invoice.tests} />

        <InvoiceTotals subtotal={invoice.subtotal} total={invoice.total} />

        <PayButton
          invoiceId={invoiceId}
          amount={invoice.total}
          paymentLink={invoice.payment_status === 'pending' ? invoice.payment_link : null}
          className="mb-4"
        />
        <p className="mb-4 text-center text-sm text-muted-foreground">
          Recorded payment status: {invoice.payment_status}. Confirm the latest status after
          checkout.
        </p>
        <Link
          href={`/pay/${encodeURIComponent(invoiceId)}/success`}
          className="mb-6 block text-center text-sm font-medium text-primary underline underline-offset-4"
        >
          Check payment status
        </Link>

        <div className="text-center text-sm text-muted-foreground">
          <p>Forge sandbox hosted checkout. Synthetic payments only; no real bank settlement.</p>
        </div>
      </div>
    </div>
  );
}
