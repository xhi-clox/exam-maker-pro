'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell } from 'lucide-react';
import { SidebarTrigger } from '../ui/sidebar';
import { Logo } from '../icons/Logo';
import { useSidebar } from '../ui/sidebar';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const { isMobile } = useSidebar();
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white px-6">
      <div className={cn("flex items-center gap-2", !isMobile && "md:hidden")}>
         <SidebarTrigger />
         <Logo className="h-7 w-7 text-primary" />
          <span className="text-xl font-semibold text-foreground">
            ExamPaper Pro
          </span>
      </div>
       <div className={cn("flex items-center gap-2", isMobile ? "hidden" : "invisible")}>
         <Logo className="h-7 w-7 text-primary" />
          <span className="text-xl font-semibold text-foreground">
            ExamPaper Pro
          </span>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
            <Bell className="size-5" />
            <span className="sr-only">Notifications</span>
        </Button>
        <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold">
            JS
            </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
