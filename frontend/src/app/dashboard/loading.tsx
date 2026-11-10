import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';

export default function DashboardLoading() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    </div>
  );
}
