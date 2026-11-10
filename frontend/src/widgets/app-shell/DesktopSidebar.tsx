'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, FlaskConical, LayoutDashboard, Plus, Activity } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const destinations = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/terminal', label: 'Create order', icon: Plus },
  { href: '/tech', label: 'Fulfillment', icon: FlaskConical },
];

export const DesktopSidebar = () => {
  const pathname = usePathname();
  return (
    <aside className="workspace-sidebar">
      <Link href="/" className="brand">
        <Activity aria-hidden="true" />
        <span>
          DxPay<span className="brand-dot">.</span>
        </span>
      </Link>
      <div className="workspace-scope">
        <span className="scope-mark">D</span>
        <div>
          <strong>Diagnostic workspace</strong>
          <p>Development sandbox</p>
        </div>
      </div>
      <nav aria-label="Workspace" className="workspace-nav">
        {destinations.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href ? 'page' : undefined}
            className={cn('workspace-nav-link', pathname === href && 'is-active')}
          >
            <Icon aria-hidden="true" size={18} strokeWidth={1.6} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <p>One bill. Clear allocations.</p>
        <span>Sandbox only. No live funds.</span>
        <Link href="/">
          Back to website <ArrowUpRight aria-hidden="true" size={14} />
        </Link>
      </div>
    </aside>
  );
};
