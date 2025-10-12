'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  FileText,
  BookCopy,
  FolderKanban,
  Settings,
  LifeBuoy,
  FileSignature,
} from 'lucide-react';


const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/editor', label: 'Editor', icon: FileSignature },
  { href: '/templates', label: 'Templates', icon: BookCopy },
  { href: '/question-bank', label: 'Question Bank', icon: FolderKanban },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        {/* The header content is now in AppHeader.tsx */}
      </SidebarHeader>
      <SidebarContent className="p-2 mt-16">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                tooltip={{ children: item.label, side: 'right' }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-2">
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={pathname === '/help'}
                    tooltip={{ children: 'Help & Support', side: 'right' }}
                >
                    <Link href="/help">
                        <LifeBuoy />
                        <span>Help & Support</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
