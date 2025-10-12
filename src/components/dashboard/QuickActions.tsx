
'use client';

import {
  FilePlus,
  Sparkles,
  Banknote, // Placeholder, assuming 'Store #21' is about a question bank
} from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const actions = [
    {
      title: "Question Bank",
      description: "Access and manage your question bank.",
      href: "/question-bank",
      borderColor: "border-purple-500",
      textColor: "text-purple-500"
    },
    {
      title: "New Blank Paper",
      description: "Start creating an exam paper from scratch with our editor.",
      href: "/editor",
      borderColor: "border-primary",
      textColor: "text-primary"
    },
    {
      title: "Generate from Topic",
      description: "AI-powered paper generation from a topic.",
      href: "/ai/suggest",
      borderColor: "border-green-500",
      textColor: "text-green-500"
    },
]

export function QuickActions() {
  return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {actions.map((action) => (
             <Link href={action.href} key={action.title} className="block group">
                <Card className={cn("p-5 shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 border-l-4", action.borderColor)}>
                    <h3 className="font-semibold text-foreground mb-2">{action.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                    <div className={cn("inline-flex items-center gap-2 font-medium text-sm", action.textColor)}>
                        <span>{action.title === 'New Blank Paper' ? 'Create Paper' : 'Open'}</span>
                        <ArrowRight className="size-4" />
                    </div>
                </Card>
            </Link>
        ))}
      </div>
  );
}
