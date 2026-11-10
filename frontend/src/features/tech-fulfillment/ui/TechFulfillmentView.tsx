import { FlaskConical } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/ui/button';

export const TechFulfillmentView = () => (
  <div className="space-y-6">
    <section
      aria-label="Fulfillment connection"
      className="rounded-lg border border-border bg-card p-6 text-foreground"
    >
      <div className="flex items-start gap-4">
        <FlaskConical aria-hidden="true" className="mt-1 size-5 shrink-0 text-muted-foreground" />
        <div>
          <h2 className="text-base font-semibold">Queue unavailable</h2>
          <p role="status" className="mt-2 text-sm text-muted-foreground">
            Fulfillment is not connected. The backend does not yet provide a technician queue or
            test-status updates.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            No paid orders or processing activity are shown until they can be verified by the
            service.
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link href="/terminal">Open order terminal</Link>
          </Button>
        </div>
      </div>
    </section>
  </div>
);
