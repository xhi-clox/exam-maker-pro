
import { AppLayout } from '@/components/layout/AppLayout';

export default function EditorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppLayout defaultOpen={false}>
        {children}
    </AppLayout>
  );
}
