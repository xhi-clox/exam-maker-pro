
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Edit, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

const recentPapers = [
  {
    id: 'paper-1',
    title: 'Advanced Calculus Midterm',
    status: 'Completed',
    lastUpdated: '2 days ago',
  },
  {
    id: 'paper-2',
    title: 'Organic Chemistry Final',
    status: 'Draft',
    lastUpdated: '5 hours ago',
  },
  {
    id: 'paper-3',
    title: 'English Literature Quiz',
    status: 'Completed',
    lastUpdated: '1 week ago',
  },
];

export function RecentPapers() {
  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-muted-foreground font-medium">Paper Name</TableHead>
              <TableHead className="text-muted-foreground font-medium">Status</TableHead>
              <TableHead className="text-muted-foreground font-medium">Last Updated</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentPapers.map((paper) => (
              <TableRow key={paper.id} className="hover:bg-muted/50">
                <TableCell className="font-semibold text-foreground">{paper.title}</TableCell>
                <TableCell>
                  {paper.status === 'Completed' ? (
                    <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 hover:bg-cyan-100/80">
                        <CheckCircle className="mr-1.5 size-3.5" />
                        Completed
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80">
                        <Edit className="mr-1.5 size-3.5" />
                        Draft
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{paper.lastUpdated}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-end mt-4">
            <Link href="#" className="inline-flex items-center gap-2 text-primary font-medium text-sm">
                <span>View All Papers</span>
                <ArrowRight className="size-4" />
            </Link>
        </div>
      </CardContent>
    </Card>
  );
}
