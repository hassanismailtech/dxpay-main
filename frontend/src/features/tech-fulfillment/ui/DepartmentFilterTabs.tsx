'use client';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

interface DepartmentFilterTabsProps {
  departments: Array<{ id: string; name: string }>;
  activeDepartment: string;
  onDepartmentChange: (dept: string) => void;
  activeFilter: 'queue' | 'history';
  onFilterChange: (filter: 'queue' | 'history') => void;
  className?: string;
}

export function DepartmentFilterTabs({
  departments,
  activeDepartment,
  onDepartmentChange,
  activeFilter,
  onFilterChange,
  className,
}: DepartmentFilterTabsProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Department Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {departments.map((dept) => (
          <Button
            key={dept.id}
            variant={activeDepartment === dept.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onDepartmentChange(dept.id)}
            className={cn(
              'flex-1',
              activeDepartment === dept.id
                ? 'bg-card  text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {dept.name}
          </Button>
        ))}
      </div>

      {/* Queue/History Toggle */}
      <div className="flex space-x-2">
        <Button
          variant={activeFilter === 'queue' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('queue')}
          className={cn(
            activeFilter === 'queue'
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Queue
        </Button>
        <Button
          variant={activeFilter === 'history' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('history')}
          className={cn(
            activeFilter === 'history'
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          History
        </Button>
      </div>
    </div>
  );
}
