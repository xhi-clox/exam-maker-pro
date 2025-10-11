
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Paper } from '@/types';
import { MoreHorizontal, FilePlus, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

const recentPapers: Paper[] = [
  {
    id: 'paper-1',
    title: 'বার্ষিক পরীক্ষা ২০২২',
    subject: 'গণিত',
    grade: '10ম',
    lastUpdated: '2 দিন আগে',
  },
  {
    id: 'paper-2',
    title: 'Mid-term Test',
    subject: 'English',
    grade: '12th',
    lastUpdated: '5 দিন আগে',
  },
  {
    id: 'paper-3',
    title: 'সাপ্তাহিক পরীক্ষা',
    subject: 'বিজ্ঞান',
    grade: '8ম',
    lastUpdated: '1 সপ্তাহ আগে',
  },
  {
    id: 'paper-4',
    title: 'বাংলা ১ম পত্র মডেল টেস্ট',
    subject: 'বাংলা',
    grade: '9ম',
    lastUpdated: '2 সপ্তাহ আগে',
  },
];

export function RecentPapers() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline">Recent Papers</CardTitle>
          <CardDescription>Here are the papers you've recently worked on.</CardDescription>
        </div>
        <Button variant="outline" asChild>
            <Link href="#">
                View All <ChevronRight className="ml-2 size-4" />
            </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>শিরোনাম</TableHead>
              <TableHead>বিষয়</TableHead>
              <TableHead> শ্রেি</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentPapers.map((paper) => (
              <TableRow key={paper.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-medium">
                  <Link href={`/editor/${paper.id}`} className="hover:underline">
                    {paper.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{paper.subject}</Badge>
                </TableCell>
                <TableCell>{paper.grade}</TableCell>
                <TableCell className="text-muted-foreground">{paper.lastUpdated}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
