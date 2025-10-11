'use client';

import {
  BrainCircuit,
  Rocket,
} from 'lucide-react';
import { AiActionCard } from './AiActionCard';

export function QuickActions() {
  return (
    <div>
      <h2 className="text-xl font-semibold font-headline text-foreground mb-4">দ্রুত শুরু করুন</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
        <AiActionCard
          Icon={BrainCircuit}
          title="ছবি থেকে প্রশ্ন"
          description="AI দিয়ে প্রশ্ন তৈরি করুন"
          href="/editor/image"
        />
        <AiActionCard
          Icon={Rocket}
          title="New Blank Paper"
          description="Start from scratch"
          href="/editor"
        />
      </div>
    </div>
  );
}
