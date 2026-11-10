'use client';

import { Button } from '@/shared/ui/button';
import { Download } from 'lucide-react';
import type { PaymentVerification } from '../api/paymentApi';

export function DownloadReceiptButton({ verification }: { verification?: PaymentVerification }) {
  const verified =
    verification?.payment_status === 'successful' && verification.allocation_status === 'allocated';
  const handleDownload = () => {
    if (!verified || !verification) return;
    const receiptContent = `
DXPAY SANDBOX PAYMENT RECEIPT
================================
Reference: ${verification.reference}
Amount: NGN ${verification.amount.toFixed(2)}
Status: verified sandbox payment
Provider allocation: recorded locally
Synthetic funds only. Not proof of real bank settlement.
================================
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagnosticspay-receipt.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Button onClick={handleDownload} disabled={!verified} variant="outline" className="w-full">
      <Download className="h-4 w-4 mr-2" />
      Download Receipt
    </Button>
  );
}
