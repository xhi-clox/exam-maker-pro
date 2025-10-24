
'use client';

import { Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { Logo } from '../icons/Logo';
import { Avatar, AvatarFallback } from '../ui/avatar';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="flex items-center gap-2">
        <Logo className="h-7 w-7 text-primary" />
        <span className="text-xl font-semibold text-foreground">
          ExamPaper Pro
        </span>
      </div>

      <div className="flex-1 flex justify-center">
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Avatar>
          <AvatarFallback>JS</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
