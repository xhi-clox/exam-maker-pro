
'use client';

import {
  BrainCircuit,
  FilePlus,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';


const actions = [
    {
      Icon: Sparkles,
      title: "AI Suggest Question Paper",
      description: "Generate a paper from a topic",
      href: "/ai/suggest",
      color: "bg-green-500",
      className: "from-green-500/10 to-green-500/5",
    },
    {
      Icon: BrainCircuit,
      title: "ছবি থেকে প্রশ্ন",
      description: "AI দিয়ে প্রশ্ন তৈরি করুন",
      href: "/editor/image",
      color: "bg-purple-500",
      className: "from-purple-500/10 to-purple-500/5",
    },
    {
      Icon: FilePlus,
      title: "New Blank Paper",
      description: "Start from scratch",
      href: "/editor",
      color: "bg-blue-500",
      className: "from-blue-500/10 to-blue-500/5",
    },
]

export function QuickActions() {
  return (
    <div>
      <h2 className="text-xl font-semibold font-headline text-foreground mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action) => (
             <Link href={action.href} key={action.title}>
                <div className={cn("group relative p-6 rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br", action.className)}>
                    <div className="flex items-start gap-4">
                        <div className={cn("flex-shrink-0 p-2 rounded-full", action.color)}>
                            <action.Icon className="size-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">{action.title}</h3>
                            <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                    </div>
                </div>
            </Link>
        ))}
      </div>
    </div>
  );
}
