import { Building } from 'lucide-react';

interface ActiveDepartmentBannerProps {
  department: string;
  className?: string;
}

export function ActiveDepartmentBanner({ department, className }: ActiveDepartmentBannerProps) {
  return (
    <div className={`bg-primary text-primary-foreground px-6 py-4 rounded-lg ${className}`}>
      <div className="flex items-center space-x-3">
        <Building className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm text-muted-foreground ">Active Department</p>
          <p className="text-lg font-semibold">{department}</p>
        </div>
      </div>
    </div>
  );
}
