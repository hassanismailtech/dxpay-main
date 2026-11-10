'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Plus, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/widgets/page-header/PageHeader';
import { RevenueStatCards } from '@/features/lab-dashboard/ui/RevenueStatCards';
import { TransactionTable } from '@/features/lab-dashboard/ui/TransactionTable';
import { useDashboardStore } from '@/features/lab-dashboard/model/useDashboardStore';
import { Button } from '@/shared/ui/button';

export const LabDashboardPage = () => {
  const { stats, transactions, expandedTxnId, isLoading, error, fetchData, toggleExpand } =
    useDashboardStore();
  useEffect(() => {
    void fetchData(1);
  }, [fetchData]);
  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="Diagnostic payments and provider allocations."
        actions={
          <Button asChild>
            <Link href="/terminal">
              <Plus size={16} aria-hidden="true" />
              Create order
            </Link>
          </Button>
        }
      />
      <div className="scope-row">
        <span>
          Provider 1 <span aria-hidden="true">·</span> All time
        </span>
        <Button variant="outline" size="sm" onClick={() => fetchData(1)} disabled={isLoading}>
          <RefreshCw size={14} aria-hidden="true" className={isLoading ? 'animate-spin' : ''} />
          {isLoading ? 'Refreshing' : 'Refresh'}
        </Button>
      </div>
      <RevenueStatCards
        totalRevenue={error || !stats ? undefined : stats.totalRevenue}
        activeOrders={error || !stats ? undefined : stats.activeOrders}
        isLoading={isLoading && !stats}
      />
      <div className="allocation-note">
        <span className="status-dot" />
        <p>
          Provider allocations are internal ledger entries, not bank settlements. This workspace
          uses sandbox payments only.
        </p>
      </div>
      {error ? (
        <section className="data-error" role="alert">
          <h2>Payment data is unavailable</h2>
          <p>{error}</p>
          <Button variant="outline" onClick={() => fetchData(1)}>
            Try again
          </Button>
        </section>
      ) : isLoading && !stats ? (
        <section className="loading-panel" role="status">
          <h2>Transaction ledger</h2>
          <p>Loading verified payments…</p>
          <div className="skeleton" />
          <div className="skeleton" />
        </section>
      ) : (
        <TransactionTable
          transactions={transactions}
          expandedTxnId={expandedTxnId}
          onToggleExpand={toggleExpand}
        />
      )}
      <section className="workflow-summary">
        <div>
          <h2>From order to allocation</h2>
          <p>
            Select tests, generate one invoice, and verify the payment before recording provider
            shares.
          </p>
        </div>
        <Link href="/terminal">
          Create a diagnostic order <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </>
  );
};
