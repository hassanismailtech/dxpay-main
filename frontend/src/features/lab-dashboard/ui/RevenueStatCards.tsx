import { CurrencyAmount } from '@/shared/ui/CurrencyAmount';
import { cn } from '@/shared/lib/utils';

interface RevenueStatCardsProps {
  totalRevenue?: number;
  settledSplits?: number;
  activeOrders?: number;
  className?: string;
  isLoading?: boolean;
}

export const RevenueStatCards = ({
  totalRevenue,
  activeOrders,
  className,
  isLoading,
}: RevenueStatCardsProps) => (
  <section
    aria-label="Payment totals"
    className={cn('metric-strip', className)}
    aria-busy={isLoading}
  >
    <div>
      <h2>Allocated revenue</h2>
      <p className="metric-value">
        {isLoading ? (
          <span className="skeleton" />
        ) : totalRevenue === undefined ? (
          '—'
        ) : (
          <CurrencyAmount amount={totalRevenue} className="inherit-value" />
        )}
      </p>
      <span>Verified provider share · NGN</span>
    </div>
    <div>
      <h2>Paid tests</h2>
      <p className="metric-value metric-secondary">
        {isLoading ? '—' : activeOrders === undefined ? '—' : activeOrders.toLocaleString('en-NG')}
      </p>
      <span>Recorded against this provider</span>
    </div>
    <div>
      <h2>Bank settlement</h2>
      <p className="metric-value metric-secondary">Not connected</p>
      <span>No payout or settlement assumed</span>
    </div>
  </section>
);
