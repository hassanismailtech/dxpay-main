'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FlaskConical, LayoutDashboard, Plus } from 'lucide-react';

export const MobileBottomNav = () => {
  const pathname = usePathname();
  return (
    <nav aria-label="Mobile workspace" className="mobile-nav">
      {[
        { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
        { href: '/terminal', label: 'New order', icon: Plus },
        { href: '/tech', label: 'Fulfillment', icon: FlaskConical },
      ].map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined}>
          <Icon size={19} aria-hidden="true" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
};
