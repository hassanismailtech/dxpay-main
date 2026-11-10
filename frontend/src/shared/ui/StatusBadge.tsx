import { cn } from '@/shared/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const variant = ['Ready to Process', 'Paid', 'Completed', 'Success'].includes(status)
    ? 'status-positive'
    : ['Awaiting', 'Pending'].includes(status)
      ? 'status-warning'
      : status === 'Failed'
        ? 'bg-destructive/10 text-destructive'
        : 'status-neutral';
  return <span className={cn('status-badge', variant, className)}>{status}</span>;
};
