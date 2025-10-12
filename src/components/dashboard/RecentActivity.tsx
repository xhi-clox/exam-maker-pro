'use client';

import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const activities = [
    {
        description: 'You published "Advanced Calculus Midterm"',
        time: '2 hours ago'
    },
    {
        description: 'New user registered for your "Organic Chemistry" course',
        time: 'Yesterday'
    },
    {
        description: 'You started a new draft for "Physics I Final"',
        time: '3 days ago'
    }
];


export function RecentActivity() {
  return (
    <Card className="shadow-lg">
      <CardContent className="p-6 space-y-4">
        {activities.map((activity, index) => (
            <div key={index} className="flex flex-col">
                <p className="text-sm text-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
        ))}
         <div className="flex justify-end pt-2">
            <Link href="#" className="inline-flex items-center gap-2 text-primary font-medium text-sm">
                <span>View Full History</span>
                <ArrowRight className="size-4" />
            </Link>
        </div>
      </CardContent>
    </Card>
  );
}
