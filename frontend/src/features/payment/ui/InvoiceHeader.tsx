interface InvoiceHeaderProps {
  invoiceNumber: string;
  className?: string;
}

export function InvoiceHeader({ invoiceNumber, className }: InvoiceHeaderProps) {
  return (
    <div className={`text-center mb-8 ${className}`}>
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
            <span className="text-primary-foreground font-bold text-lg">DP</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">DxPay invoice</h1>
            <p className="text-sm text-muted-foreground">Diagnostic payments</p>
          </div>
        </div>
      </div>
      <div className="bg-muted px-4 py-2 rounded-lg inline-block max-w-full">
        <p className="text-sm font-medium text-muted-foreground">Invoice reference</p>
        <p className="break-all text-sm font-semibold text-foreground">{invoiceNumber}</p>
      </div>
    </div>
  );
}
