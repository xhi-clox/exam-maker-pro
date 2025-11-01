
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateProjectModal } from './CreateProjectModal';
import { useRouter } from 'next/navigation';
import { useProjects } from '@/hooks/use-projects';
import type { Project } from '@/types';

const actions = [
    {
      title: "Question Bank",
      description: "Access and manage your question bank.",
      href: "/question-bank",
      borderColor: "border-purple-500",
      textColor: "text-purple-500",
      actionText: "Open",
      type: 'link'
    },
    {
      title: "New Blank Paper",
      description: "Start creating an exam paper from scratch with our editor.",
      href: "/editor",
      borderColor: "border-primary",
      textColor: "text-primary",
      actionText: "Create Paper",
      type: 'project'
    },
    {
      title: "Generate from Topic",
      description: "AI-powered paper generation from a topic.",
      href: "/ai/suggest",
      borderColor: "border-green-500",
      textColor: "text-green-500",
      actionText: "Open",
      type: 'project'
    },
];

export function QuickActions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nextStep, setNextStep] = useState<string | null>(null);
  const router = useRouter();
  const { addProject } = useProjects();

  const handleActionClick = (type: string, href: string) => {
    if (type === 'project') {
      setNextStep(href);
      setIsModalOpen(true);
    } else {
      router.push(href);
    }
  };

  const handleCreateProject = (project: Omit<Project, 'id' | 'lastUpdated'>) => {
    const newProject = addProject(project);
    setIsModalOpen(false);
    if (nextStep) {
        // Here you would typically associate the new project with the action,
        // e.g., by passing project ID in the URL.
        // For now, we'll just navigate.
        router.push(`${nextStep}?project=${newProject.id}`);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {actions.map((action) => (
          <button
            key={action.title}
            onClick={() => handleActionClick(action.type, action.href)}
            className="block group text-left h-full"
          >
            <Card className={cn("p-5 shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 border-l-4 h-full flex flex-col", action.borderColor)}>
              <h3 className="font-semibold text-foreground mb-2">{action.title}</h3>
              <p className="text-sm text-muted-foreground flex-grow">{action.description}</p>
              <div className={cn("inline-flex items-center gap-2 font-medium text-sm mt-4", action.textColor)}>
                <span>{action.actionText}</span>
                <ArrowRight className="size-4" />
              </div>
            </Card>
          </button>
        ))}
      </div>
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </>
  );
}
