import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppSidebar } from '@/components/layout/AppSidebar';

export const metadata: Metadata = {
  title: 'Bangla Exam Maker Pro',
  description: 'A comprehensive tool for Bangladeshi teachers to create exam papers with AI assistance.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <div className="flex min-h-screen">
          <AppSidebar />
          <main className="flex-1 md:ml-[260px] p-6">
              {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
