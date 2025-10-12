import { EditorHeaderActionsProvider } from './EditorHeaderActions';
import { AppHeader } from './AppHeader';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <EditorHeaderActionsProvider>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <AppHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {children}
        </main>
        </div>
    </EditorHeaderActionsProvider>
  );
}
