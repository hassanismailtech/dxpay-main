'use client';

import { Search } from 'lucide-react';
import { Input } from '@/shared/ui/input';

export const TestSearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => (
  <div className="relative">
    <Search
      aria-hidden="true"
      className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
    />
    <Input
      aria-label="Search tests"
      type="search"
      placeholder="Search tests"
      onChange={(event) => onSearch(event.target.value)}
      className="pl-10"
    />
  </div>
);
