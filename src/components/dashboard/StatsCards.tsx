
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, BrainCircuit, Users } from 'lucide-react';
import type { Stat } from '@/types';
import { cn } from '@/lib/utils';

const stats: Stat[] = [
  {
    name: 'মোট প্রশ্নপত্র',
    value: '42',
    Icon: FileText,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  {
    name: 'AI দিয়ে তৈরি',
    value: '15',
    Icon: BrainCircuit,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10"
  },
  {
    name: 'মোট প্রশ্ন',
    value: '530',
    Icon: Users,
    color: "text-green-500",
    bgColor: "bg-green-500/10"
  },
];

export function StatsCards() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline">Statistics</CardTitle>
        <CardDescription>Your activity at a glance.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="flex items-center space-x-4 rounded-lg border p-4">
            <div className={cn("flex size-10 items-center justify-center rounded-lg", stat.bgColor)}>
              <stat.Icon className={cn("size-5", stat.color)} />
            </div>
            <div className="flex-1 space-y-0.5">
              <p className="text-sm font-medium leading-none text-muted-foreground">{stat.name}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
