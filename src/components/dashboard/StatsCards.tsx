import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, BrainCircuit, Users } from 'lucide-react';
import type { Stat } from '@/types';

const stats: Stat[] = [
  {
    name: 'মোট প্রশ্নপত্র',
    value: '42',
    Icon: FileText,
  },
  {
    name: 'AI দিয়ে তৈরি',
    value: '15',
    Icon: BrainCircuit,
  },
  {
    name: 'মোট প্রশ্ন',
    value: '530',
    Icon: Users,
  },
];

export function StatsCards() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">পরিসংখ্যান</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="flex items-center space-x-4 rounded-md border p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <stat.Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none text-muted-foreground">{stat.name}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
