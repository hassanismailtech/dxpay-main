'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/widgets/page-header/PageHeader';
import { QuickAddGrid } from '@/features/order-management/ui/QuickAddGrid';
import { TestSearchBar } from '@/features/order-management/ui/TestSearchBar';
import { TestCatalogList } from '@/features/order-management/ui/TestCatalogList';
import { OrderSummary } from '@/features/order-management/ui/OrderSummary';
import { useOrderStore } from '@/features/order-management/model/useOrderStore';
import { Button } from '@/shared/ui/button';
import { LoaderCircle } from 'lucide-react';

export const DoctorTerminalPage = () => {
  const { paymentLink, availableTests, addTest, loadCatalog, catalogStatus, catalogError } =
    useOrderStore();
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);
  useEffect(() => {
    if (paymentLink) window.location.assign(paymentLink);
  }, [paymentLink]);
  const filteredTests = availableTests.filter((test) =>
    test.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );
  return (
    <div>
      <PageHeader
        title="Order terminal"
        subtitle="Select diagnostic tests and prepare a payment link. All prices are in NGN."
      />
      <div className="grid items-start gap-6 xl:grid-cols-3">
        <div className="min-w-0 space-y-6 xl:col-span-2">
          {catalogStatus === 'loading' || catalogStatus === 'idle' ? (
            <section
              aria-label="Test catalogue"
              className="rounded-lg border border-border bg-card p-6"
            >
              <h2 className="mb-4 text-base font-semibold text-foreground">Test catalogue</h2>
              <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                Loading test catalogue...
              </p>
            </section>
          ) : catalogStatus === 'error' ? (
            <section className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-base font-semibold text-foreground">
                Test catalogue unavailable
              </h2>
              <p role="alert" className="my-3 text-sm text-muted-foreground">
                {catalogError}
              </p>
              <Button variant="outline" onClick={loadCatalog}>
                Retry catalogue
              </Button>
            </section>
          ) : (
            <>
              {availableTests.length > 0 && (
                <QuickAddGrid tests={availableTests} onAddTest={addTest} />
              )}
              <section aria-labelledby="catalog-title" className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 id="catalog-title" className="text-base font-semibold text-foreground">
                    Test catalogue
                  </h2>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {filteredTests.length} tests
                  </span>
                </div>
                <TestSearchBar onSearch={setSearchQuery} />
                {filteredTests.length ? (
                  <TestCatalogList tests={filteredTests} />
                ) : (
                  <p className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
                    {availableTests.length
                      ? 'No tests match your search.'
                      : 'No tests are available in the catalogue.'}
                  </p>
                )}
              </section>
            </>
          )}
        </div>
        <div className="min-w-0 xl:sticky xl:top-6">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
};

export default DoctorTerminalPage;
