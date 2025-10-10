'use client';
import { useState, useEffect } from 'react';
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
import { Plus, Type, Pilcrow, Image as ImageIcon, Download, Eye, Trash2, GripVertical } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

// Define types for our question structure
interface Question {
  id: string;
  type: 'passage' | 'fill-in-the-blanks' | 'short' | 'mcq' | 'essay';
  content: string;
  marks?: number;
  subQuestions?: Question[];
}

interface Paper {
  schoolName: string;
  examTitle: string;
  subject: string;
  grade: string;
  board: string;
  timeAllowed: string;
  totalMarks: number;
  questions: Question[];
}

const initialPaperData: Paper = {
  schoolName: 'এবিসি বিদ্যালয়, ঢাকা',
  examTitle: 'বার্ষিক পরীক্ষা - ২০২৪',
  subject: 'bangla',
  grade: '9',
  board: 'dhaka',
  timeAllowed: '৩ ঘন্টা',
  totalMarks: 100,
  questions: [
    {
      id: 'q1',
      type: 'passage',
      content: 'নিচের অনুচ্ছেদটি পড় এবং প্রশ্নগুলোর উত্তর দাও:',
      subQuestions: [
        { id: 'q1a', type: 'short', content: 'ক) রউফ কেন নিজে দায়িত্ব নিলেন?', marks: 2 },
        { id: 'q1b', type: 'short', content: 'খ) কীভাবে তিনি শহিদ হলেন?', marks: 3 },
        { id: 'q1c', type: 'essay', content: 'গ) দেশের জন্য তার আত্মত্যাগের মহিমা বর্ণনা কর।', marks: 5 },
      ]
    },
    {
      id: 'q2',
      type: 'fill-in-the-blanks',
      content: 'খালি ځای পূরণ কর:',
      subQuestions: [
        { id: 'q2a', type: 'fill-in-the-blanks', content: 'ক) _____ দেশের গৌরব।', marks: 1 },
        { id: 'q2b', type: 'fill-in-the-blanks', content: 'খ) তিনি ____ রক্ষা করার জন্য জীবন দিলেন।', marks: 1 },
      ]
    }
  ],
};


const QuestionActions = ({ onRemove }: { onRemove: () => void }) => (
  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
    <Button variant="ghost" size="icon" className="h-7 w-7 cursor-grab">
      <GripVertical className="size-4" />
    </Button>
    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onRemove}>
      <Trash2 className="size-4" />
    </Button>
  </div>
);

const renderQuestion = (question: Question, onRemove: (id: string) => void) => {
  const handleRemove = () => onRemove(question.id);

  switch (question.type) {
    case 'passage':
      return (
        <Card key={question.id} className="group relative p-4 space-y-3 bg-slate-50">
          <QuestionActions onRemove={handleRemove} />
          <Label className="font-bold">অনুচ্ছেদ</Label>
          <Textarea defaultValue={question.content} className="bg-white" />
          <div className="pl-6 space-y-2">
            {question.subQuestions?.map((sq, index) => (
              <div key={sq.id} className="flex items-center gap-2">
                <Textarea defaultValue={sq.content} className="flex-grow bg-white" />
                <Input type="number" defaultValue={sq.marks} className="w-20" />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm"><Plus className="mr-2 size-4" /> প্রশ্ন যোগ করুন</Button>
          </div>
        </Card>
      );
    case 'fill-in-the-blanks':
       return (
        <Card key={question.id} className="group relative p-4 space-y-3 bg-slate-50">
           <QuestionActions onRemove={handleRemove} />
           <Label className="font-bold">শূন্যস্থান পূরণ</Label>
           <div className="pl-6 space-y-2">
             {question.subQuestions?.map((sq, index) => (
              <div key={sq.id} className="flex items-center gap-2">
                <Textarea defaultValue={sq.content} className="flex-grow bg-white" />
                <Input type="number" defaultValue={sq.marks} className="w-20" />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0">
                  <Trash2 className="size-4" />
                </Button>
              </div>
             ))}
            <Button variant="outline" size="sm"><Plus className="mr-2 size-4" /> শূন্যস্থান যোগ করুন</Button>
           </div>
        </Card>
      );
    default:
      return null;
  }
}

export default function EditorPage() {
  const [paper, setPaper] = useState<Paper>(initialPaperData);

  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      type: type,
      content: '',
      subQuestions: [],
    };

    if (type === 'passage') {
      newQuestion.content = 'নিচের অনুচ্ছেদটি পড় এবং প্রশ্নগুলোর উত্তর দাও:';
      newQuestion.subQuestions = [{ id: `sq${Date.now()}`, type: 'short', content: 'ক) ', marks: 2 }];
    } else if (type === 'fill-in-the-blanks') {
       newQuestion.content = 'খালি ځای পূরণ কর:';
       newQuestion.subQuestions = [{ id: `sq${Date.now()}`, type: 'fill-in-the-blanks', content: 'ক) ', marks: 1 }];
    }

    setPaper(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const removeQuestion = (id: string) => {
    setPaper(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id),
    }))
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-slate-50 text-foreground">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">প্রশ্নপত্র सम्पादक</h1>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline"><Eye className="mr-2 size-4" /> Preview</Button>
            <Button><Download className="mr-2 size-4" /> Download PDF</Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_450px]">
          {/* Left Column */}
          <div className="flex flex-col gap-6 overflow-y-auto p-6">
            
            {/* Question Area */}
            <div className="flex-1 rounded-lg bg-white p-6 border space-y-4">
              <div className="text-center space-y-2 mb-8">
                 <Input className="text-2xl font-bold text-center border-0 focus-visible:ring-0 shadow-none" defaultValue={paper.schoolName} />
                 <Input className="text-lg text-center border-0 focus-visible:ring-0 shadow-none" defaultValue={paper.examTitle} />
              </div>
              <div className="flex justify-between text-sm">
                <p>বিষয়: <Input className="inline-block w-auto border-0 focus-visible:ring-0 shadow-none" defaultValue="বাংলা"/></p>
                <p>পূর্ণমান: <Input type="number" className="inline-block w-20 border-0 focus-visible:ring-0 shadow-none" defaultValue={paper.totalMarks}/></p>
              </div>
               <div className="flex justify-between text-sm">
                <p>শ্রেণি: <Input className="inline-block w-auto border-0 focus-visible:ring-0 shadow-none" defaultValue="নবম"/></p>
                <p>সময়: <Input className="inline-block w-auto border-0 focus-visible:ring-0 shadow-none" defaultValue={paper.timeAllowed}/></p>
              </div>
              <hr className="my-6" />

              {paper.questions.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-center text-muted-foreground rounded-lg border-2 border-dashed">
                  <p className="font-semibold">আপনার প্রশ্নপত্রটি খালি</p>
                  <p className="text-sm">ডানদিকের প্যানেল থেকে প্রশ্ন যোগ করুন।</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paper.questions.map(q => renderQuestion(q, removeQuestion))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Toolbar) */}
          <div className="flex flex-col border-l bg-white overflow-y-auto">
             <div className="p-6 space-y-6">
                {/* Add Questions */}
                <Card>
                  <CardHeader>
                    <CardTitle>প্রশ্ন যোগ করুন</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <Button variant="outline" onClick={() => addQuestion('passage')}><Pilcrow className="mr-2 size-4" /> অনুচ্ছেদ</Button>
                    <Button variant="outline" onClick={() => addQuestion('mcq')}><Plus className="mr-2 size-4" /> MCQ</Button>
                    <Button variant="outline" onClick={() => addQuestion('short')}><Type className="mr-2 size-4" /> সংক্ষিপ্ত প্রশ্ন</Button>
                    <Button variant="outline" onClick={() => addQuestion('fill-in-the-blanks')}><Type className="mr-2 size-4" /> শূন্যস্থান পূরণ</Button>
                    <Button variant="outline" onClick={() => addQuestion('essay')}><Pilcrow className="mr-2 size-4" /> রচনামূলক প্রশ্ন</Button>
                    <Link href="/editor/image" passHref>
                        <Button variant="outline" className="w-full border-primary text-primary"><ImageIcon className="mr-2 size-4" /> ছবি থেকে ইম্পোর্ট</Button>
                    </Link>
                  </CardContent>
                </Card>

                 {/* Paper Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Paper Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="school-name">School Name</Label>
                        <Input id="school-name" defaultValue={paper.schoolName} />
                      </div>
                      <div>
                        <Label htmlFor="exam-title">Exam Title</Label>
                        <Input id="exam-title" defaultValue={paper.examTitle} />
                      </div>
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Select defaultValue={paper.subject}>
                          <SelectTrigger id="subject">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bangla">বাংলা</SelectItem>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="math">গণিত</SelectItem>
                            <SelectItem value="science">বিজ্ঞান</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="class">Class</Label>
                         <Select defaultValue={paper.grade}>
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
                        <Label htmlFor="time-allowed">Time Allowed</Label>
                        <Input id="time-allowed" defaultValue={paper.timeAllowed} />
                      </div>
                      <div>
                        <Label htmlFor="total-marks">Total Marks</Label>
                        <Input id="total-marks" type="number" defaultValue={paper.totalMarks} />
                      </div>
                  </CardContent>
                </Card>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
