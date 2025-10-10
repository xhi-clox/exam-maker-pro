'use client';

import {
  BookOpenText,
  FlaskConical,
  Calculator,
  SpellCheck,
  Landmark,
  Laptop,
  BrainCircuit,
  Rocket,
} from 'lucide-react';
import { SubjectCard } from './SubjectCard';
import { AiActionCard } from './AiActionCard';

const subjects = [
  { Icon: Calculator, title: 'গণিত', grades: '৬-১২ শ্রেণি', color: 'bg-blue-500', href: '/editor' },
  { Icon: FlaskConical, title: 'বিজ্ঞান', grades: '৬-১০ শ্রেণি', color: 'bg-green-500', href: '/editor' },
  { Icon: BookOpenText, title: 'বাংলা', grades: '৬-১২ শ্রেণি', color: 'bg-red-500', href: '/editor' },
  { Icon: SpellCheck, title: 'English', grades: '৬-১২ শ্রেণি', color: 'bg-purple-500', href: '/editor' },
  { Icon: Landmark, title: 'সামাজিক বিজ্ঞান', grades: '৬-১০ শ্রেণি', color: 'bg-orange-500', href: '/editor' },
  { Icon: Laptop, title: 'ICT', grades: '৯-১২ শ্রেণি', color: 'bg-indigo-500', href: '/editor' },
];

export function QuickActions() {
  return (
    <div>
      <h2 className="text-xl font-semibold font-headline text-foreground mb-4">দ্রুত শুরু করুন</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
        {subjects.map((subject) => (
          <SubjectCard key={subject.title} {...subject} />
        ))}
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
