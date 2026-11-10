import { Clock } from 'lucide-react';

export function ResultsReadyNotice() {
  return (
    <div className="bg-muted border border-border rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <Clock className="h-5 w-5 text-primary mt-0.5 mr-3 shrink-0" />
        <div>
          <h3 className="font-medium text-foreground mb-1">Diagnostic results</h3>
          <p className="text-muted-foreground text-sm">
            Contact your diagnostic provider for collection times. Sandbox payment confirmation does
            not indicate that results are available.
          </p>
        </div>
      </div>
    </div>
  );
}
