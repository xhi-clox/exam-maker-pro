
'use client';
import { useState, useEffect, useRef } from 'react';
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
import { Plus, Type, Pilcrow, Image as ImageIcon, Download, Eye, Trash2, GripVertical, ListOrdered, TableIcon, PlusCircle, MinusCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PaperPreview from './PaperPreview';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import MathExpressions from './MathExpressions';

type NumberingFormat = 'bangla-alpha' | 'bangla-numeric' | 'roman';

export interface Question {
  id: string;
  type: 'passage' | 'fill-in-the-blanks' | 'short' | 'mcq' | 'essay' | 'table';
  content: string;
  marks?: number;
  options?: { id: string; text: string }[];
  subQuestions?: Question[];
  numberingFormat?: NumberingFormat;
  tableData?: string[][];
  rows?: number;
  cols?: number;
}

export interface Paper {
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
      numberingFormat: 'bangla-alpha',
      marks: 10,
      subQuestions: [
        { id: 'q1a', type: 'short', content: 'রউফ কেন নিজে দায়িত্ব নিলেন?' },
        { id: 'q1b', type: 'short', content: 'কীভাবে তিনি শহিদ হলেন?' },
        { id: 'q1c', type: 'essay', content: 'দেশের জন্য তার আত্মত্যাগের মহিমা বর্ণনা কর।' },
      ]
    },
    {
      id: 'q2',
      type: 'fill-in-the-blanks',
      content: 'খালি জায়গা পূরণ কর:',
      numberingFormat: 'bangla-alpha',
      marks: 5,
      subQuestions: [
        { id: 'q2a', type: 'fill-in-the-blanks', content: '_____ দেশের গৌরব।' },
        { id: 'q2b', type: 'fill-in-the-blanks', content: 'তিনি ____ রক্ষা করার জন্য জীবন দিলেন।' },
      ]
    }
  ],
};

export default function EditorPage() {
  const [paper, setPaper] = useState<Paper>(initialPaperData);
  const previewRef = useRef<HTMLDivElement>(null);
  const [focusedInput, setFocusedInput] = useState<{ element: HTMLTextAreaElement | HTMLInputElement; id: string } | null>(null);

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>, id: string) => {
    setFocusedInput({ element: e.currentTarget, id });
  };

  const handleInsertExpression = (expression: string) => {
    if (!focusedInput) return;

    const { element, id } = focusedInput;
    const [qId, sqId] = id.split('-');
    const { selectionStart, selectionEnd } = element;
    const currentValue = element.value;
    const newValue = currentValue.substring(0, selectionStart ?? 0) + expression + currentValue.substring(selectionEnd ?? 0);

    element.value = newValue;
    element.focus();
    element.setSelectionRange((selectionStart ?? 0) + expression.length, (selectionStart ?? 0) + expression.length);

    // Manually trigger change to update state
    if (sqId) {
        if (id.startsWith('option')) {
            const [_, qId, sqId, optId] = id.split('-');
            handleOptionChange(qId, sqId, optId, newValue);
        } else {
            handleSubQuestionChange(qId, sqId, 'content', newValue);
        }
    } else {
        handleQuestionChange(qId, 'content', newValue);
    }
  };


  const handleDownloadPdf = async () => {
    const content = previewRef.current;
    if (!content) return;

    const canvas = await html2canvas(content, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('question-paper.pdf');
  };

  const handlePaperDetailChange = (field: keyof Paper, value: string | number) => {
    setPaper(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (id: string, field: 'content' | 'marks' | 'numberingFormat', value: string | number) => {
    setPaper(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === id) {
          return { ...q, [field]: value };
        }
        return q;
      })
    }));
  };
  
    const handleSubQuestionChange = (parentId: string, subId: string, field: 'content' | 'marks', value: string | number) => {
        setPaper(prev => ({
          ...prev,
          questions: prev.questions.map(q =>
            q.id === parentId ? {
              ...q,
              subQuestions: q.subQuestions?.map(sq =>
                sq.id === subId ? { ...sq, [field]: value } : sq
              )
            } : q
          )
        }));
      };
  
  const addSubQuestion = (questionId: string, type: Question['type'] = 'short') => {
    setPaper(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          const newSubQuestion: Question = {
            id: `sq${Date.now()}`,
            type: type,
            content: 'নতুন প্রশ্ন...',
            marks: 2,
          };
          if (type === 'mcq') {
            newSubQuestion.options = [
              { id: `opt${Date.now()}-1`, text: 'অপশন ১' },
              { id: `opt${Date.now()}-2`, text: 'অপশন ২' },
              { id: `opt${Date.now()}-3`, text: 'অপশন ৩' },
              { id: `opt${Date.now()}-4`, text: 'অপশন ৪' },
            ];
          }
          return {
            ...q,
            subQuestions: [...(q.subQuestions || []), newSubQuestion]
          };
        }
        return q;
      })
    }));
  };
  
  const removeSubQuestion = (questionId: string, subQuestionId: string) => {
    setPaper(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            subQuestions: q.subQuestions?.filter(sq => sq.id !== subQuestionId)
          };
        }
        return q;
      })
    }));
  };

  const addOption = (questionId: string, subQuestionId: string) => {
    setPaper(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            subQuestions: q.subQuestions?.map(sq => {
              if (sq.id === subQuestionId) {
                const newOption = { id: `opt${Date.now()}`, text: 'নতুন অপশন' };
                return {
                  ...sq,
                  options: [...(sq.options || []), newOption]
                };
              }
              return sq;
            })
          };
        }
        return q;
      })
    }));
  };

  const removeOption = (questionId: string, subQuestionId: string, optionId: string) => {
    setPaper(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            subQuestions: q.subQuestions?.map(sq => {
              if (sq.id === subQuestionId) {
                return {
                  ...sq,
                  options: sq.options?.filter(opt => opt.id !== optionId)
                };
              }
              return sq;
            })
          };
        }
        return q;
      })
    }));
  };

  const handleOptionChange = (questionId: string, subQuestionId: string, optionId: string, text: string) => {
    setPaper(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            subQuestions: q.subQuestions?.map(sq => {
                if (sq.id === subQuestionId) {
                    return {
                        ...sq,
                        options: sq.options?.map(opt =>
                            opt.id === optionId ? { ...opt, text } : opt
                        )
                    };
                }
                return sq;
            })
          };
        }
        return q;
      })
    }));
  };

  const handleTableCellChange = (questionId: string, rowIndex: number, colIndex: number, value: string) => {
    setPaper(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          const newTableData = q.tableData?.map((row, rIdx) => 
            rIdx === rowIndex ? row.map((cell, cIdx) => cIdx === colIndex ? value : cell) : row
          );
          return { ...q, tableData: newTableData };
        }
        return q;
      })
    }));
  };
  
  const addRow = (questionId: string) => {
    setPaper(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          const newRow = Array(q.cols || 1).fill('');
          return { ...q, tableData: [...(q.tableData || []), newRow], rows: (q.rows || 0) + 1 };
        }
        return q;
      })
    }));
  };
  
  const removeRow = (questionId: string) => {
    setPaper(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && q.rows && q.rows > 1) {
          const newTableData = q.tableData?.slice(0, -1);
          return { ...q, tableData: newTableData, rows: q.rows - 1 };
        }
        return q;
      })
    }));
  };
  
  const addCol = (questionId: string) => {
    setPaper(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          const newTableData = q.tableData?.map(row => [...row, '']);
          return { ...q, tableData: newTableData, cols: (q.cols || 0) + 1 };
        }
        return q;
      })
    }));
  };
  
  const removeCol = (questionId: string) => {
    setPaper(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && q.cols && q.cols > 1) {
          const newTableData = q.tableData?.map(row => row.slice(0, -1));
          return { ...q, tableData: newTableData, cols: q.cols - 1 };
        }
        return q;
      })
    }));
  };

  const getNumbering = (format: NumberingFormat | undefined, index: number): string => {
    const banglaNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const banglaAlphabet = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ', 'ঝ', 'ঞ', 'ট', 'ঠ', 'ড', 'ঢ', 'ণ', 'ত', 'থ', 'দ', 'ধ', 'ন'];
    const toRoman = (num: number): string => {
      const roman = {M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1};
      let str = '';
      for (let i of Object.keys(roman)) {
        let q = Math.floor(num / (roman as any)[i]);
        num -= q * (roman as any)[i];
        str += i.repeat(q);
      }
      return str.toLowerCase();
    };

    switch (format) {
      case 'bangla-numeric':
        return (index + 1).toString().split('').map(d => banglaNumerals[parseInt(d)]).join('');
      case 'roman':
        return toRoman(index + 1);
      case 'bangla-alpha':
      default:
        return banglaAlphabet[index % banglaAlphabet.length];
    }
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

  const renderQuestion = (question: Question, index: number) => {
    const handleRemove = () => removeQuestion(question.id);
    const isContainer = ['passage', 'fill-in-the-blanks', 'short', 'essay', 'mcq', 'table'].includes(question.type);

    const questionCard = (title: string, children: React.ReactNode, showNumberingAndMarks = false) => (
        <Card key={question.id} className="group relative p-4 space-y-3 bg-slate-50">
          <QuestionActions onRemove={handleRemove} />
          <div className="flex items-center justify-between">
            <div className='flex items-center gap-2'>
              <Label className="font-bold">{`${index + 1}. ${title}`}</Label>
            </div>
            {showNumberingAndMarks && (
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <Label htmlFor={`marks-${question.id}`} className="text-sm">Marks:</Label>
                    <Input 
                      id={`marks-${question.id}`}
                      type="number" 
                      value={question.marks} 
                      onChange={(e) => handleQuestionChange(question.id, 'marks', Number(e.target.value))}
                      className="w-20 h-8"
                      placeholder="Marks"
                    />
                 </div>
                <div className="flex items-center gap-2">
                    <Label htmlFor={`numbering-${question.id}`} className="text-sm">নাম্বারিং:</Label>
                    <Select 
                      value={question.numberingFormat} 
                      onValueChange={(value: NumberingFormat) => handleQuestionChange(question.id, 'numberingFormat', value)}
                    >
                      <SelectTrigger id={`numbering-${question.id}`} className="w-32 h-8 text-xs">
                        <SelectValue placeholder="Format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bangla-alpha">ক, খ, গ</SelectItem>
                        <SelectItem value="bangla-numeric">১, ২, ৩</SelectItem>
                        <SelectItem value="roman">i, ii, iii</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
              </div>
            )}
          </div>
          {children}
        </Card>
      );

      const subQuestionRenderer = (qType: Question['type']) => (
        <>
            <Textarea 
                value={question.content} 
                onChange={(e) => handleQuestionChange(question.id, 'content', e.target.value)}
                onFocus={(e) => handleFocus(e, question.id)}
                className="bg-white" />
            <div className="pl-6 space-y-2">
            {question.subQuestions?.map((sq, sqIndex) => (
                <div key={sq.id} className="flex items-start gap-2 pt-2">
                <span className="font-semibold pt-2">{getNumbering(question.numberingFormat, sqIndex)})</span>
                <div className="flex-grow space-y-2">
                  <div className="flex items-center gap-2">
                    <Textarea 
                        value={sq.content} 
                        onChange={(e) => handleSubQuestionChange(question.id, sq.id, 'content', e.target.value)}
                        onFocus={(e) => handleFocus(e, `${question.id}-${sq.id}`)}
                        className="flex-grow bg-white" />
                     <div className="flex items-center gap-2">
                        <Input 
                        type="number" 
                        value={sq.marks} 
                        onChange={(e) => handleSubQuestionChange(question.id, sq.id, 'marks', Number(e.target.value))}
                        className="w-20 h-8"
                        placeholder="Marks"
                        />
                     </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => removeSubQuestion(question.id, sq.id)}>
                        <Trash2 className="size-4" />
                    </Button>
                  </div>
                  {sq.type === 'mcq' && (
                    <div className="pl-8 space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {sq.options?.map((opt, optIndex) => (
                                <div key={opt.id} className="flex items-center gap-2">
                                <span className="font-semibold">{getNumbering('bangla-alpha', optIndex)})</span>
                                <Input 
                                    value={opt.text}
                                    onChange={(e) => handleOptionChange(question.id, sq.id, opt.id, e.target.value)}
                                    onFocus={(e) => handleFocus(e, `option-${question.id}-${sq.id}-${opt.id}`)}
                                    className="bg-white"
                                />
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0 opacity-0 group-hover/sub:opacity-100" onClick={() => removeOption(question.id, sq.id, opt.id)}>
                                    <Trash2 className="size-4" />
                                </Button>
                                </div>
                            ))}
                        </div>
                         <Button variant="outline" size="sm" onClick={() => addOption(question.id, sq.id)}><Plus className="mr-2 size-4" /> অপশন যোগ করুন</Button>
                    </div>
                  )}
                </div>
                </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => addSubQuestion(question.id, qType)}><Plus className="mr-2 size-4" /> প্রশ্ন যোগ করুন</Button>
            </div>
        </>
    );

    switch (question.type) {
        case 'passage':
            return questionCard('অনুচ্ছেদ', subQuestionRenderer('short'), true);
        case 'fill-in-the-blanks':
             return questionCard('শূন্যস্থান পূরণ', subQuestionRenderer('fill-in-the-blanks'), true);
        case 'short':
          return questionCard('সংক্ষিপ্ত প্রশ্ন', subQuestionRenderer('short'), true);
        case 'essay':
          return questionCard('রচনামূলক প্রশ্ন', subQuestionRenderer('essay'), true);
        case 'mcq':
             return questionCard('বহুনির্বাচনি প্রশ্ন (MCQ)', subQuestionRenderer('mcq'), true);
        case 'table':
            return questionCard('সারণী প্রশ্ন', (
                <>
                  <Textarea
                    value={question.content}
                    onChange={(e) => handleQuestionChange(question.id, 'content', e.target.value)}
                    onFocus={(e) => handleFocus(e, question.id)}
                    className="bg-white mb-4"
                    placeholder="সারণী সম্পর্কিত নির্দেশাবলী এখানে লিখুন..."
                  />
                  <div className="flex gap-2 mb-2">
                     <Button size="sm" variant="outline" onClick={() => addRow(question.id)}><PlusCircle className="mr-2 size-4" /> Add Row</Button>
                     <Button size="sm" variant="outline" onClick={() => removeRow(question.id)}><MinusCircle className="mr-2 size-4" /> Remove Row</Button>
                     <Button size="sm" variant="outline" onClick={() => addCol(question.id)}><PlusCircle className="mr-2 size-4" /> Add Column</Button>
                     <Button size="sm" variant="outline" onClick={() => removeCol(question.id)}><MinusCircle className="mr-2 size-4" /> Remove Column</Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-400">
                      <tbody>
                        {question.tableData?.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, colIndex) => (
                              <td key={colIndex} className="border border-slate-300 p-0">
                                <Textarea
                                  value={cell}
                                  onChange={(e) => handleTableCellChange(question.id, rowIndex, colIndex, e.target.value)}
                                  className="w-full h-full border-0 rounded-none focus-visible:ring-1 ring-inset focus-visible:ring-blue-400"
                                  rows={2}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ), true);
        default:
            return null;
    }
  }

  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      type: type,
      content: '',
      marks: 5,
    };

    if (type === 'passage' || type === 'short' || type === 'essay' || type === 'fill-in-the-blanks' || type === 'mcq') {
      newQuestion.subQuestions = [];
      newQuestion.numberingFormat = 'bangla-alpha';
  
      switch (type) {
        case 'passage':
          newQuestion.content = 'নিচের অনুচ্ছেদটি পড় এবং প্রশ্নগুলোর উত্তর দাও:';
          newQuestion.marks = 10;
          newQuestion.subQuestions.push({ id: `sq${Date.now()}`, type: 'short', content: 'নতুন প্রশ্ন...', marks: 2});
          break;
        case 'fill-in-the-blanks':
          newQuestion.content = 'খালি জায়গা পূরণ কর:';
          newQuestion.marks = 5;
          newQuestion.subQuestions.push({ id: `sq${Date.now()}`, type: 'fill-in-the-blanks', content: 'নতুন লাইন...', marks: 1});
          break;
        case 'short':
          newQuestion.content = 'নিচের প্রশ্নগুলোর উত্তর দাও:';
          newQuestion.marks = 10;
          newQuestion.subQuestions.push({ id: `sq${Date.now()}`, type: 'short', content: 'নতুন প্রশ্ন...', marks: 2});
          break;
        case 'essay':
          newQuestion.content = 'নিচের প্রশ্নগুলোর উত্তর দাও:';
          newQuestion.marks = 20;
          newQuestion.subQuestions.push({ id: `sq${Date.now()}`, type: 'essay', content: 'নতুন রচনামূলক প্রশ্ন...', marks: 5});
          break;
        case 'mcq':
            newQuestion.content = 'সঠিক উত্তরটি বেছে নাও:';
            newQuestion.marks = 10;
            newQuestion.numberingFormat = 'bangla-numeric';
            newQuestion.subQuestions.push({
                id: `sq${Date.now()}`,
                type: 'mcq',
                content: 'নতুন MCQ প্রশ্ন...',
                marks: 1,
                options: [
                    { id: `opt${Date.now()}-1`, text: 'অপশন ১' },
                    { id: `opt${Date.now()}-2`, text: 'অপশন ২' },
                    { id: `opt${Date.now()}-3`, text: 'অপশন ৩' },
                    { id: `opt${Date.now()}-4`, text: 'অপশন ৪' },
                ]
            });
            break;
      }
    }
    
    if (type === 'table') {
        newQuestion.content = 'Make four sentences from the substitution table.';
        newQuestion.marks = 4;
        newQuestion.rows = 3;
        newQuestion.cols = 3;
        newQuestion.tableData = [
            ['A moonlit night', 'is', 'in the habit of enjoying a moonlit night very much'],
            ['The poets', '', 'different from any other night'],
            ['People in the village', 'are', 'friendly with others in a moonlit night'],
        ];
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
          <h1 className="text-xl font-bold">প্রশ্নপত্র सम्पादক</h1>
        </div>
        <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline"><Eye className="mr-2 size-4" /> Preview</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>Question Paper Preview</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-auto bg-gray-100 p-4">
                  <div ref={previewRef}>
                    <PaperPreview paper={paper} />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={handleDownloadPdf}><Download className="mr-2 size-4" /> Download PDF</Button>
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
                 <Input className="text-2xl font-bold text-center border-0 focus-visible:ring-0 shadow-none" value={paper.schoolName} onChange={e => handlePaperDetailChange('schoolName', e.target.value)} />
                 <Input className="text-lg text-center border-0 focus-visible:ring-0 shadow-none" value={paper.examTitle} onChange={e => handlePaperDetailChange('examTitle', e.target.value)} />
              </div>
              <div className="flex justify-between text-sm">
                 <p>বিষয়: <Input className="inline-block w-auto border-0 focus-visible:ring-0 shadow-none" value={paper.subject} onChange={e => handlePaperDetailChange('subject', e.target.value)} /></p>
                 <p>পূর্ণমান: <Input type="number" className="inline-block w-20 border-0 focus-visible:ring-0 shadow-none" value={paper.totalMarks} onChange={e => handlePaperDetailChange('totalMarks', parseInt(e.target.value))}/></p>
              </div>
               <div className="flex justify-between text-sm">
                <p>শ্রেণি: <Input className="inline-block w-auto border-0 focus-visible:ring-0 shadow-none" value={paper.grade} onChange={e => handlePaperDetailChange('grade', e.target.value)} /></p>
                <p>সময়: <Input className="inline-block w-auto border-0 focus-visible:ring-0 shadow-none" value={paper.timeAllowed} onChange={e => handlePaperDetailChange('timeAllowed', e.target.value)}/></p>
              </div>
              <hr className="my-6" />

              {paper.questions.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-center text-muted-foreground rounded-lg border-2 border-dashed">
                  <p className="font-semibold">আপনার প্রশ্নপত্রটি খালি</p>
                  <p className="text-sm">ডানদিকের প্যানেল থেকে প্রশ্ন যোগ করুন।</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paper.questions.map((q, index) => renderQuestion(q, index))}
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
                    <Button variant="outline" onClick={() => addQuestion('mcq')}><ListOrdered className="mr-2 size-4" /> MCQ</Button>
                    <Button variant="outline" onClick={() => addQuestion('short')}><Type className="mr-2 size-4" /> সংক্ষিপ্ত প্রশ্ন</Button>
                    <Button variant="outline" onClick={() => addQuestion('fill-in-the-blanks')}><Type className="mr-2 size-4" /> শূন্যস্থান পূরণ</Button>
                    <Button variant="outline" onClick={() => addQuestion('essay')}><Pilcrow className="mr-2 size-4" /> রচনামূলক প্রশ্ন</Button>
                    <Button variant="outline" onClick={() => addQuestion('table')}><TableIcon className="mr-2 size-4" /> সারণী</Button>
                    <Link href="/editor/image" passHref>
                        <Button variant="outline" className="w-full border-primary text-primary"><ImageIcon className="mr-2 size-4" /> ছবি থেকে ইম্পোর্ট</Button>
                    </Link>
                  </CardContent>
                </Card>

                <MathExpressions onInsert={handleInsertExpression} />

                 {/* Paper Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Paper Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="school-name">School Name</Label>
                        <Input id="school-name" value={paper.schoolName} onChange={e => handlePaperDetailChange('schoolName', e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="exam-title">Exam Title</Label>
                        <Input id="exam-title" value={paper.examTitle} onChange={e => handlePaperDetailChange('examTitle', e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Select value={paper.subject} onValueChange={value => handlePaperDetailChange('subject', value)}>
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
                         <Select value={paper.grade} onValueChange={value => handlePaperDetailChange('grade', value)}>
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
                        <Input id="time-allowed" value={paper.timeAllowed} onChange={e => handlePaperDetailChange('timeAllowed', e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="total-marks">Total Marks</Label>
                        <Input id="total-marks" type="number" value={paper.totalMarks} onChange={e => handlePaperDetailChange('totalMarks', parseInt(e.target.value))} />
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
