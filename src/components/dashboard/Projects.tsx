
'use client';

import { useProjects } from '@/hooks/use-projects';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Book, GraduationCap, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function Projects() {
  const { projects } = useProjects();
  const router = useRouter();

  const handleProjectClick = (projectId: string) => {
    router.push(`/editor?project=${projectId}`);
  };

  if (projects.length === 0) {
    return (
      <Card className="text-center p-8 border-2 border-dashed">
        <p className="text-muted-foreground">You don't have any projects yet.</p>
        <p className="text-sm text-muted-foreground">
          Use the "Quick Actions" to create a new one.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {projects.map((project) => (
        <Card
          key={project.id}
          className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={() => handleProjectClick(project.id)}
        >
          <h3 className="font-semibold text-lg text-foreground truncate">{project.name}</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <div className="flex items-center gap-1.5">
              <Book className="size-4" />
              <span>{project.subject}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GraduationCap className="size-4" />
              <span>Class {project.class}</span>
            </div>
          </div>
           <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3">
              <Clock className="size-3" />
              <span>Updated {formatDistanceToNow(new Date(project.lastUpdated), { addSuffix: true })}</span>
            </div>
        </Card>
      ))}
    </div>
  );
}
