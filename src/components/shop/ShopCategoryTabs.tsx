'use client';

import { useCallback } from 'react';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'all', label: 'All', href: '#all' },
  { id: 'modafinil', label: 'Modafinil', href: '#modafinil' },
  { id: 'armodafinil', label: 'Armodafinil', href: '#armodafinil' },
  { id: 'combos', label: 'Combos', href: '#combos' },
] as const;

export function ShopCategoryTabs() {
  const scrollTo = useCallback((hash: string) => {
    const id = hash.replace('#', '');
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div
      className="sticky top-[4.5rem] z-30 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:mx-0 lg:px-0"
      role="tablist"
      aria-label="Filter by category"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            onClick={() => scrollTo(tab.href)}
            className={cn(
              'rounded-full border border-transparent px-4 py-2 text-sm font-medium transition-colors',
              'hover:border-primary/40 hover:bg-primary/10 hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
