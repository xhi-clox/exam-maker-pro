
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentPapers } from '@/components/dashboard/RecentPapers';
import { StatsCards } from '@/components/dashboard/StatsCards';

export default function Home() {
  return (
      <div className="flex flex-col gap-8">
        <header>
          <h1 className="text-3xl font-bold font-headline text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground font-body">
            Welcome back! Here's a summary of your activity.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-3 space-y-6">
              <QuickActions />
          </div>
          <div className="md:col-span-2">
            <StatsCards />
          </div>
        </div>
        
        <RecentPapers />
        
      </div>
  );
}
