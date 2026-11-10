import { cn, formatNaira } from '@/shared/lib/utils';

interface CurrencyAmountProps {
  amount: number;
  className?: string;
  showSymbol?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'text-sm font-medium',
  md: 'text-base font-semibold',
  lg: 'text-lg font-semibold',
};

export const CurrencyAmount = ({
  amount,
  className,
  showSymbol = true,
  size = 'md',
}: CurrencyAmountProps) => (
  <span className={cn(sizes[size], 'tabular-nums text-foreground whitespace-nowrap', className)}>
    {showSymbol
      ? formatNaira(amount)
      : amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
  </span>
);
