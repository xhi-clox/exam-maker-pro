'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, GripVertical, FileText, BrainCircuit, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { suggestQuestionPaper, SuggestQuestionPaperInput, SuggestQuestionPaperOutput } from '@/ai/flows/ai-suggest-question-paper';

type Question = {
  id: string;
  type: 'mcq' | 'short' | 'essay';
  content: string;
  marks: number;
};

type Section = {
  id: string;
  title: string;
  questions: Question[];
};

export default function EditorPage() {
  const [title, setTitle] = useState('Untitled Exam Paper');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [sections, setSections] = useState<Section[]>([
    {
      id: `section-${Date.now()}`,
      title: 'Section A',
      questions: [],
    },
  ]);

  const addSection = () => {
    setSections([
      ...sections,
      {
        id: `section-${Date.now()}`,
        title: `Section ${String.fromCharCode(65 + sections.length)}`,
        questions: [],
      },
    ]);
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter((s) => s.id !== sectionId));
  };

  const addQuestion = (sectionId: string) => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      type: 'short',
      content: '',
      marks: 5,
    };
    setSections(
      sections.map((s) =>
        s.id === sectionId ? { ...s, questions: [...s.questions, newQuestion] } : s
      )
    );
  };

  const removeQuestion = (sectionId: string, questionId: string) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? { ...s, questions: s.questions.filter((q) => q.id !== questionId) }
          : s
      )
    );
  };

  const [isGenerating, setIsGenerating] = useState(false);

  const handleAiGenerate = async () => {
    if (!subject || !grade) {
      // Maybe show a toast message
      return;
    }
    setIsGenerating(true);
    try {
      const input: SuggestQuestionPaperInput = { topic: subject, gradeLevel: grade };
      const result = await suggestQuestionPaper(input);
      setTitle(result.title);
      setSubject(result.subject);
      setGrade(result.grade);
      setSections(result.sections.map((s, si) => ({
        id: `section-${si}`,
        title: s.title,
        questions: s.questions.map((q, qi) => ({
          id: `question-${si}-${qi}`,
          type: q.type as any,
          content: q.content,
          marks: q.marks,
        }))
      })));
    } catch (error) {
      console.error("Failed to generate question paper:", error);
    }
    setIsGenerating(false);
  };


  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <header className="mb-8">
          <Input
            className="border-none text-3xl font-bold font-headline !ring-0 !outline-none p-0 h-auto"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Exam Paper"
          />
          <p className="mt-1 text-muted-foreground">
            আপনার প্রশ্নপত্র এখানে সম্পাদনা করুন। প্রশ্ন যোগ করুন, নম্বর নির্ধারণ করুন এবং প্রয়োজনমত সাজিয়ে নিন।
          </p>
        </header>

        {sections.map((section, sectionIndex) => (
          <Card key={section.id} className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Input
                  className="text-xl font-semibold font-headline border-none p-0 h-auto !ring-0 !outline-none"
                  value={section.title}
                  onChange={(e) => {
                    const newSections = [...sections];
                    newSections[sectionIndex].title = e.target.value;
                    setSections(newSections);
                  }}
                />
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => removeSection(section.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                  <GripVertical className="size-5 text-muted-foreground cursor-grab" />
                </div>
              </div>

              <div className="space-y-4">
                {section.questions.map((question, questionIndex) => (
                  <div key={question.id} className="flex gap-4 items-start p-4 border rounded-lg bg-background">
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="প্রশ্নটি এখানে লিখুন..."
                        className="!ring-0 !outline-none border-none p-0"
                        value={question.content}
                        onChange={(e) => {
                          const newSections = [...sections];
                          newSections[sectionIndex].questions[questionIndex].content = e.target.value;
                          setSections(newSections);
                        }}
                      />
                      <div className="flex items-center gap-4">
                         <Input
                            type="number"
                            className="w-20 h-8"
                            placeholder="Marks"
                            value={question.marks}
                            onChange={(e) => {
                              const newSections = [...sections];
                              newSections[sectionIndex].questions[questionIndex].marks = parseInt(e.target.value, 10) || 0;
                              setSections(newSections);
                            }}
                          />
                      </div>
                    </div>
                     <Button variant="ghost" size="icon" onClick={() => removeQuestion(section.id, question.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="mt-4 w-full border-dashed"
                onClick={() => addQuestion(section.id)}
              >
                <PlusCircle className="mr-2 size-4" />
                নতুন প্রশ্ন যোগ করুন
              </Button>
            </CardContent>
          </Card>
        ))}

        <Button variant="secondary" className="w-full" onClick={addSection}>
          <FileText className="mr-2 size-4" />
          নতুন সেকশন যোগ করুন
        </Button>
      </main>

      <aside className="w-80 border-l bg-card p-6 space-y-6 hidden md:block">
        <h2 className="text-xl font-semibold font-headline">Editor Controls</h2>
        <div className="space-y-4">
            <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="e.g., বাংলা" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div>
                <Label htmlFor="grade">Grade</Label>
                <Input id="grade" placeholder="e.g., 10" value={grade} onChange={(e) => setGrade(e.target.value)} />
            </div>
        </div>
        <Separator />
        <div>
          <h3 className="text-lg font-semibold mb-2 font-headline">AI Assistant</h3>
           <Button className="w-full" onClick={handleAiGenerate} disabled={isGenerating}>
            <BrainCircuit className="mr-2 size-4" />
            {isGenerating ? 'Generating...' : 'Suggest a Paper'}
          </Button>
        </div>
        <Separator />
         <div>
          <h3 className="text-lg font-semibold mb-2 font-headline">Export</h3>
           <Button className="w-full" variant="outline">
            <Download className="mr-2 size-4" />
            Download as PDF
          </Button>
        </div>
      </aside>
    </div>
  );
}
