'use client';

import { TestCategory } from '@/entities/test/model/types';
import { Button } from '@/shared/ui/button';

interface TestCatalogTabsProps {
  activeCategory: TestCategory | 'all';
  onCategoryChange: (category: TestCategory | 'all') => void;
  className?: string;
}

const categories: Array<{ id: TestCategory | 'all'; name: string }> = [
  { id: 'all', name: 'All Tests' },
  { id: 'hematology', name: 'Hematology' },
  { id: 'radiology', name: 'Radiology' },
  { id: 'chemistry', name: 'Chemistry' },
];

export function TestCatalogTabs({
  activeCategory,
  onCategoryChange,
  className,
}: TestCatalogTabsProps) {
  return (
    <div className={`flex space-x-1 bg-muted p-1 rounded-lg ${className}`}>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={activeCategory === category.id ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onCategoryChange(category.id)}
          className="flex-1"
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}
