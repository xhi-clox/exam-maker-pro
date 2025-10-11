
'use client';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';

interface AiActionCardProps {
  Icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

export function AiActionCard({ Icon, title, description, href }: AiActionCardProps) {
  return (
    <Card className="relative col-span-2 overflow-hidden bg-gradient-to-br from-primary via-accent to-primary/80 text-primary-foreground shadow-lg transition-transform hover:scale-[1.02] hover:shadow-xl">
      <Link href={href} className="block h-full">
        <CardHeader className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <div className="mb-4 flex size-12 items-center justify-center rounded-lg border border-white/20 bg-white/10">
              <Icon className="size-6" />
            </div>
            <CardTitle className="font-headline text-xl">{title}</CardTitle>
            <CardDescription className="text-primary-foreground/80">{description}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="mt-4 justify-start p-0 text-primary-foreground hover:bg-transparent hover:text-primary-foreground">
            এখনই শুরু করুন <ArrowRight className="ml-2 size-4" />
          </Button>
        </CardHeader>
        <div className="absolute inset-0 bg-[image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </Link>
    </Card>
  );
}
