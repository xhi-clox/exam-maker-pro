'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrainCircuit, Upload, ArrowRight } from 'lucide-react';
import { imageToQuestionPaper } from '@/ai/flows/image-to-question-paper';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';

export default function ImageToQuestionPage() {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [extractedJson, setExtractedJson] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image) return;
    setIsLoading(true);
    try {
      const result = await imageToQuestionPaper({ photoDataUri: image });
      setExtractedJson(result.questionPaper);
    } catch (error) {
      console.error('Failed to convert image to question paper:', error);
      // You can add a toast notification here to inform the user
    }
    setIsLoading(false);
  };
  
  const openEditorWithContent = () => {
    // This is a simplified version. In a real app, you'd likely want to
    // save this to a database and then redirect to the editor with the new paper's ID.
    // For now, we'll use localStorage as a temporary bridge.
    try {
      const paperData = JSON.parse(extractedJson);
      localStorage.setItem('newImageData', JSON.stringify(paperData));
      router.push('/editor?from=image');
    } catch (e) {
      console.error("Invalid JSON format");
      // Show error toast
    }
  };


  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold font-headline">ছবি থেকে প্রশ্ন তৈরি করুন</h1>
        <p className="text-muted-foreground mt-2">
          আপনার প্রশ্নের ছবি আপলোড করুন এবং AI-এর সাহায্যে ডিজিটাল প্রশ্নপত্রে রূপান্তর করুন।
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>১. ছবি আপলোড করুন</CardTitle>
            <CardDescription>আপনার প্রশ্নপত্রের একটি স্পষ্ট ছবি নির্বাচন করুন।</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 p-6">
            <div
              className="w-full h-64 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {image ? (
                <img src={image} alt="Uploaded paper" className="max-h-full max-w-full object-contain" />
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12" />
                  <p>ছবি আপলোড করতে এখানে ক্লিক করুন</p>
                  <p className="text-xs">PNG, JPG, or WEBP</p>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageUpload}
              accept="image/png, image/jpeg, image/webp"
            />
            <Button onClick={handleGenerate} disabled={!image || isLoading} className="w-full">
              <BrainCircuit className="mr-2 size-4" />
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
              className="h-64 font-code"
              value={extractedJson}
              readOnly={!extractedJson}
              placeholder="এখানে AI দ্বারা তৈরি JSON আউটপুট দেখা যাবে..."
            />
            <Button onClick={openEditorWithContent} disabled={!extractedJson} className="w-full">
              এডিটরে খুলুন <ArrowRight className="ml-2 size-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
