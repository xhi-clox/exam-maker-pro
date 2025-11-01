
import { WelcomeSection } from '@/components/dashboard/WelcomeSection';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentPapers } from '@/components/dashboard/RecentPapers';
import { Statistics } from '@/components/dashboard/Statistics';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Projects } from '@/components/dashboard/Projects';
import { FileText, Clock, BarChart2, History, FolderKanban } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 lg:p-8">
      <WelcomeSection />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-8">
          <section>
              <div className="flex items-center gap-3 mb-5">
                  <FileText className="text-primary size-5" />
                  <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
              </div>
              <QuickActions />
          </section>

          <section>
                <div className="flex items-center gap-3 mb-5">
                    <FolderKanban className="text-primary size-5" />
                    <h3 className="text-lg font-semibold text-foreground">Projects</h3>
                </div>
                <Projects />
          </section>
          
          <section>
              <div className="flex items-center gap-3 mb-5">
                  <Clock className="text-primary size-5" />
                  <h3 className="text-lg font-semibold text-foreground">Recent Papers</h3>
              </div>
              <RecentPapers />
          </section>
        </div>
        <div className="lg:col-span-1 space-y-8">
           <section>
              <div className="flex items-center gap-3 mb-5">
                  <BarChart2 className="text-primary size-5" />
                  <h3 className="text-lg font-semibold text-foreground">Statistics</h3>
              </div>
              <Statistics />
          </section>
          <section>
              <div className="flex items-center gap-3 mb-5">
                  <History className="text-primary size-5" />
                  <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
              </div>
              <RecentActivity />
          </section>
        </div>
      </div>
      
      <footer className="text-center py-5 border-t">
          <p className="text-sm text-muted-foreground">Bangla Exam Maker Pro &copy; 2024. All rights reserved.</p>
      </footer>
    </div>
  );
}
