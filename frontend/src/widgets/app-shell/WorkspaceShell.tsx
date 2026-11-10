'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { DesktopSidebar } from '@/widgets/app-shell/DesktopSidebar';
import { MobileBottomNav } from '@/widgets/app-shell/MobileBottomNav';

export const WorkspaceShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  if (
    !['/dashboard', '/terminal', '/tech'].some(
      (route) => pathname === route || pathname?.startsWith(`${route}/`),
    )
  ) {
    return <>{children}</>;
  }
  return (
    <div className="workspace">
      <DesktopSidebar />
      <div className="workspace-body">
        <header className="workspace-topbar">
          <Link href="/" className="font-semibold tracking-tight">
            DxPay
          </Link>
          <span>
            Diagnostic payments <span aria-hidden="true">/</span> <strong>Sandbox workspace</strong>
          </span>
          <span className="workspace-currency">NGN · ₦</span>
        </header>
        <main id="main-content" className="workspace-content">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
};
