
'use client';

import { EditorHeader } from "./EditorHeader";

export default function EditorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-[calc(100vh_-_theme(spacing.24))]">
        <EditorHeader />
        {children}
    </div>
  );
}
