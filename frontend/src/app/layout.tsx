import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import { WorkspaceShell } from '@/widgets/app-shell/WorkspaceShell';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'DxPay | Diagnostic payments, connected', template: '%s | DxPay' },
  description:
    'One diagnostic invoice, a coordinated payment journey, and clear provider allocations. Built for the Access Bank Youth Forge Hackathon.',
};
export const viewport: Viewport = { themeColor: '#14283f', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" data-scroll-behavior="smooth">
      <body>
        <WorkspaceShell>{children}</WorkspaceShell>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--card)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}
