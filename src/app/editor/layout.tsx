
'use client';

import { EditorHeaderActionsProvider } from "@/components/layout/EditorHeaderActions";

export default function EditorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <EditorHeaderActionsProvider>
        {children}
      </EditorHeaderActionsProvider>
  );
}
