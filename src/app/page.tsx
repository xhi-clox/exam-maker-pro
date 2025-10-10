import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentPapers } from '@/components/dashboard/RecentPapers';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">
          📝 Bangla Exam Maker Pro
        </h1>
        <p className="mt-1 text-muted-foreground font-body">
          বাংলাদেশের শিক্ষকদের জন্য প্রশ্নপত্র তৈরির সবচেয়ে সহজ প্ল্যাটফর্ম।
        </p>
      </header>

      <div className="space-y-8">
        <QuickActions />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentPapers />
          </div>
          <div className="lg:col-span-1">
            <StatsCards />
          </div>
        </div>
      </div>
    </div>
  );
}
