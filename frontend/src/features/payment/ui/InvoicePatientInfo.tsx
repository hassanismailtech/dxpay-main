interface InvoicePatientInfoProps {
  patientName: string;
  providerName: string;
  date: string;
  className?: string;
}

export function InvoicePatientInfo({
  patientName,
  providerName,
  date,
  className,
}: InvoicePatientInfoProps) {
  return (
    <div className={`bg-card p-6 rounded-lg border border-border mb-6 ${className || ''}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Patient</p>
          <p className="font-medium text-foreground">{patientName}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Healthcare provider</p>
          <p className="font-medium text-foreground">{providerName}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Date</p>
          <p className="font-medium text-foreground">
            {new Date(date).toLocaleDateString('en-NG')}
          </p>
        </div>
      </div>
    </div>
  );
}
