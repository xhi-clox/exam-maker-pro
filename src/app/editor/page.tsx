'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Type, Pilcrow, Image as ImageIcon, Download, Eye } from 'lucide-react';

export default function EditorPage() {
  const [questions, setQuestions] = useState<any[]>([]);

  return (
    <div className="flex h-screen flex-col bg-slate-50 text-foreground">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Bangla Exam Pro</h1>
          <nav className="hidden items-center gap-4 text-sm font-medium text-muted-foreground md:flex">
            <a href="#" className="hover:text-primary">Dashboard</a>
            <a href="#" className="hover:text-primary">নতুন প্রশ্নপত্র</a>
            <a href="#" className="hover:text-primary">Templates</a>
            <a href="#" className="hover:text-primary">Settings</a>
          </nav>
        </div>
        <Button>Get Started</Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-6">
        <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="flex flex-col gap-6 overflow-y-auto">
            {/* Paper Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Paper Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="md:col-span-1">
                    <Label htmlFor="school-name">School Name</Label>
                    <Input id="school-name" defaultValue="ABC School, Dhaka" />
                  </div>
                  <div className="md:col-span-1">
                    <Label htmlFor="exam-title">Exam Title</Label>
                    <Input id="exam-title" defaultValue="Annual Examination 2026" />
                  </div>
                  <div className="md:col-span-1">
                    <Label htmlFor="subject">Subject</Label>
                    <Select defaultValue="science">
                      <SelectTrigger id="subject">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="science">বিজ্ঞান</SelectItem>
                        <SelectItem value="math">গণিত</SelectItem>
                        <SelectItem value="bangla">বাংলা</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="class">Class</Label>
                    <Select defaultValue="9">
                      <SelectTrigger id="class">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9">নবম শ্রেণি</SelectItem>
                        <SelectItem value="10">দশম শ্রেণি</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="board">Board</Label>
                    <Select defaultValue="dhaka">
                      <SelectTrigger id="board">
                        <SelectValue placeholder="Select board" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dhaka">ঢাকা বোর্ড</SelectItem>
                        <SelectItem value="chittagong">চট্টগ্রাম বোর্ড</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="time-allowed">Time Allowed</Label>
                    <Input id="time-allowed" defaultValue="3 Hours" />
                  </div>
                  <div>
                    <Label htmlFor="total-marks">Total Marks</Label>
                    <Input id="total-marks" type="number" defaultValue="100" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Questions */}
            <Card>
              <CardHeader>
                <CardTitle>Add Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline"><Plus className="mr-2 size-4" /> MCQ</Button>
                  <Button variant="outline"><Type className="mr-2 size-4" /> Short</Button>
                  <Button variant="outline"><Pilcrow className="mr-2 size-4" /> Essay</Button>
                  <Button variant="outline" className="border-primary text-primary"><ImageIcon className="mr-2 size-4" /> Import from Image</Button>
                </div>
              </CardContent>
            </Card>

            {/* Question Area */}
            <div className="flex-1 rounded-lg border bg-white p-6">
              {questions.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                  <p className="font-semibold">Your paper is empty</p>
                  <p className="text-sm">Add questions using the toolbar above.</p>
                </div>
              ) : (
                <div>{/* Render questions here */}</div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col">
            <Card className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="size-5" />
                  <CardTitle className="text-xl">Live Preview</CardTitle>
                </div>
                <Button variant="default"><Download className="mr-2 size-4" /> Download PDF</Button>
              </CardHeader>
              <CardContent className="h-full pb-6">
                <div className="h-full rounded-lg bg-slate-100 p-4">
                  {/* Preview content will go here */}
                  <div className="h-full w-full bg-white shadow-md">

                  </div>
                </div>
                <div className='flex justify-center items-center pt-2'>
                  <p className='text-sm text-muted-foreground'>Page 1 of 1</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
