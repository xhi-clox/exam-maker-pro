import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SubjectCardProps {
  Icon: LucideIcon;
  title: string;
  grades: string;
  color: string;
  href: string;
}

export function SubjectCard({ Icon, title, grades, color, href }: SubjectCardProps) {
  return (
    <Card className="transform transition-transform hover:scale-105 hover:shadow-lg">
      <Link href={href} className="block">
        <CardHeader>
          <div className={cn('mb-3 flex h-12 w-12 items-center justify-center rounded-lg text-white', color)}>
            <Icon className="h-6 w-6" />
          </div>
          <CardTitle className="font-headline text-lg">{title}</CardTitle>
          <CardDescription>{grades}</CardDescription>
        </CardHeader>
      </Link>
    </Card>
  );
}
