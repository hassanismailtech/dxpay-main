import { CheckCircle } from 'lucide-react';

export function PaymentSuccessBanner() {
  return (
    <div className="bg-muted border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-full">
          <CheckCircle className="h-8 w-8 text-primary-foreground" />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-foreground text-center mb-2">
        Sandbox payment verified
      </h1>
      <p className="text-muted-foreground text-center">
        Synthetic payment confirmed. This is not real bank settlement.
      </p>
    </div>
  );
}
