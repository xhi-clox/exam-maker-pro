
import { AppHeader } from './AppHeader';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <AppHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
