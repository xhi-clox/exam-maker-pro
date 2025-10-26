
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, ArrowRight } from 'lucide-react';
import { suggestQuestionPaper, type SuggestQuestionPaperOutput } from '@/ai/flows/ai-suggest-question-paper';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AiSuggestPage() {
  const [topic, setTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState('9');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedJson, setSuggestedJson] = useState<SuggestQuestionPaperOutput | null>(null);
  const router = useRouter();

  const handleGenerate = async () => {
    if (!topic || !gradeLevel) return;
    setIsLoading(true);
    setSuggestedJson(null);
    try {
      const result = await suggestQuestionPaper({ topic, gradeLevel });
      setSuggestedJson(result);
    } catch (error) {
      console.error('Failed to suggest question paper:', error);
      // You can add a toast notification here to inform the user
    }
    setIsLoading(false);
  };
  
  const openEditorWithContent = () => {
    if (!suggestedJson) return;
    try {
      // 1. Get existing data from localStorage
      const existingDataRaw = localStorage.getItem('currentPaper');
      let combinedData = { questions: [] as any[], title: '', subject: '', grade: '' };

      if (existingDataRaw) {
        try {
          const existingData = JSON.parse(existingDataRaw);
          combinedData = { 
            ...existingData, 
            questions: Array.isArray(existingData.questions) ? existingData.questions : []
          };
        } catch {
          // If parsing fails, start with a fresh slate but prepare to append
          combinedData = { questions: [], title: '', subject: '', grade: '' };
        }
      }
      
      // 2. Extract new questions and metadata from the AI suggestion
      const newQuestions: any[] = [];
      (suggestedJson.sections || []).forEach(section => {
        newQuestions.push({
          id: `section_${Date.now()}_${Math.random()}`, // Create a unique ID for the section header
          type: 'section-header',
          content: section.title,
        });
        newQuestions.push(...(section.questions || []));
      });

      // 3. Append new questions to existing ones
      combinedData.questions.push(...newQuestions);
      
      // 4. Update metadata from the latest suggestion
      combinedData.title = suggestedJson.title;
      combinedData.subject = suggestedJson.subject;
      combinedData.grade = suggestedJson.grade;

      // 5. Save the combined data back to localStorage, using the key the editor page expects
      localStorage.setItem('newImageData', JSON.stringify(combinedData));
      
      router.push('/editor?from=suggest');
    } catch (e) {
      console.error("Invalid JSON format or localStorage error", e);
      // Show error toast
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold font-headline">AI দ্বারা প্রশ্নপত্র তৈরি করুন</h1>
        <p className="text-muted-foreground mt-2">
          একটি বিষয় এবং গ্রেড প্রদান করুন এবং AI আপনার জন্য একটি প্রশ্নপত্র তৈরি করবে।
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>১. বিবরণ প্রদান করুন</CardTitle>
            <CardDescription>প্রশ্নপত্রের জন্য একটি বিষয় এবং গ্রেড নির্বাচন করুন।</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="topic">বিষয়</Label>
              <Input
                id="topic"
                placeholder="e.g., বাংলা সাহিত্য"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">শ্রেণি</Label>
               <Select value={gradeLevel} onValueChange={setGradeLevel}>
                <SelectTrigger id="grade">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9">নবম শ্রেণি</SelectItem>
                  <SelectItem value="10">দশম শ্রেণি</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerate} disabled={!topic || !gradeLevel || isLoading} className="w-full">
              <Sparkles className="mr-2 size-4" />
              {isLoading ? 'জেনারেট হচ্ছে...' : 'প্রশ্নপত্র জেনারেট করুন'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>২. ফলাফল সম্পাদনা করুন</CardTitle>
            <CardDescription>AI দ্বারা তৈরি প্রশ্নপত্রটি দেখুন এবং প্রয়োজন হলে সম্পাদনা করুন।</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              className="h-80 font-code"
              value={suggestedJson ? JSON.stringify(suggestedJson, null, 2) : ""}
              readOnly
              placeholder="এখানে AI দ্বারা তৈরি JSON আউটপুট দেখা যাবে..."
            />
            <Button onClick={openEditorWithContent} disabled={!suggestedJson} className="w-full">
              এডিটরে খুলুন <ArrowRight className="ml-2 size-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    