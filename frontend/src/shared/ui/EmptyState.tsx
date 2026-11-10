import { cn } from '@/shared/lib/utils';
import { FileX } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  className,
  icon = <FileX className="h-12 w-12 text-gray-400" />,
}: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12', className)}>
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-500 text-sm">{description}</p>}
    </div>
  );
}
