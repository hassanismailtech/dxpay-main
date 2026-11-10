'use client';

import { Button } from '@/shared/ui/button';

const TechError = ({ reset }: { error: Error & { digest?: string }; reset: () => void }) => (
  <div className="space-y-6">
    <h1 className="mb-4 text-2xl font-semibold text-foreground">Fulfillment</h1>
    <section className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-base font-semibold text-foreground">Unable to open fulfillment</h2>
      <p role="alert" className="my-3 text-sm text-muted-foreground">
        The workspace could not be loaded. Please try again.
      </p>
      <Button variant="outline" onClick={reset}>
        Try again
      </Button>
    </section>
  </div>
);
export default TechError;
