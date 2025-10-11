
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
import { Plus, Type, Pilcrow, Image as ImageIcon, Download, Eye, Trash2, ArrowUp, ArrowDown, ListOrdered, TableIcon, PlusCircle, MinusCircle, BookMarked, Minus, Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import PaperPreview from './PaperPreview';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import MathExpressions from './MathExpressions';
import { produce } from 'immer';

type NumberingFormat = 'bangla-alpha' | 'bangla-numeric' | 'roman';

export interface Question {
  id: string;
  type: 'passage' | 'fill-in-the-blanks' | 'short' | 'mcq' | 'essay' | 'table' | 'creative' | 'section-header';
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
  notes?: string;
}

const initialPaperData: Paper = {
  schoolName: 'এবিসি বিদ্যালয়, ঢাকা',
  examTitle: 'বার্ষিক পরীক্ষা - ২০২৪',
  subject: 'bangla',
  grade: '9',
  board: 'dhaka',
  timeAllowed: '৩ ঘন্টা',
  totalMarks: 100,
  questions: [],
};

// This counter should be outside the component to persist across re-renders.
let idCounter = 0;
const generateId = (prefix: string) => {
  idCounter++;
  return `${prefix}${idCounter}`;
};

const ensureUniqueIds = (questions: Question[]): Question[] => {
  return produce(questions, draft => {
    const processNode = (node: any) => {
      // Use a more robust unique ID generator
      node.id = generateId(`${node.type || 'id_'}_`);

      if (node.options) {
        node.options.forEach((option: any) => processNode(option));
      }
      if (node.subQuestions) {
        node.subQuestions.forEach((sub: any) => processNode(sub));
      }
    };

    draft.forEach(q => processNode(q));
  });
};


export default function EditorPage() {
  const [paper, setPaper] = useState<Paper>(() => ({
    ...initialPaperData,
    questions: ensureUniqueIds(initialPaperData.questions),
  }));
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [focusedInput, setFocusedInput] = useState<{ element: HTMLTextAreaElement | HTMLInputElement; id: string } | null>(null);

  useEffect(() => {
    const from = searchParams.get('from');
    if ((from === 'image' || from === 'suggest') && paper) {
      const data = localStorage.getItem('newImageData');
      if (data) {
        try {
          const parsedData = JSON.parse(data);

          setPaper(currentPaper => {
            if (!currentPaper) return initialPaperData;

            const newQuestions = parsedData.questions ? ensureUniqueIds(parsedData.questions) : [];

            return produce(currentPaper, draft => {
              draft.questions.push(...newQuestions);
              // Optionally update header info if the paper is new/empty
              if (currentPaper.questions.length === 0) {
                 draft.schoolName = parsedData.schoolName || draft.schoolName;
                 draft.examTitle = parsedData.examTitle || draft.examTitle;
                 draft.subject = parsedData.subject || draft.subject;
                 draft.grade = parsedData.grade || draft.grade;
              }
            });
          });

        } catch (e) {
          console.error("Failed to parse or append paper data from localStorage", e);
        } finally {
          localStorage.removeItem('newImageData');
          // Clean up URL without re-rendering
          const url = new URL(window.location.href);
          url.searchParams.delete('from');
          router.replace(url.pathname, { scroll: false });
        }
      }
    }
  }, [searchParams, router, paper]);

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>, id: string) => {
    setFocusedInput({ element: e.currentTarget, id });
  };

  const handleInsertExpression = (expression: string) => {
    if (!focusedInput || !paper) return;

    const { element, id } = focusedInput;
    const { selectionStart, selectionEnd } = element;
    const currentValue = element.value;
    const newValue = currentValue.substring(0, selectionStart ?? 0) + expression + currentValue.substring(selectionEnd ?? 0);

    element.value = newValue;
    element.focus();
    element.setSelectionRange((selectionStart ?? 0) + expression.length, (selectionStart ?? 0) + expression.length);

    if (id.startsWith('option')) {
        const [_, qId, sqId, optId] = id.split('-');
        handleOptionChange(qId, sqId, optId, newValue);
    } else if (id.includes('-')) {
        const [qId, sqId] = id.split('-');
        handleSubQuestionChange(qId, sqId, 'content', newValue);
    } else {
        handleQuestionChange(id, 'content', newValue);
    }
  };

  const handleDownloadPdf = async () => {
    const container = previewContainerRef.current;
    if (!container || !paper) return;

    const originalPages = Array.from(container.querySelectorAll<HTMLDivElement>('.paper-page'));
    if (originalPages.length === 0) return;

    let n = originalPages.length;
    const paddedPages: (HTMLDivElement | null)[] = [...originalPages];
    while (paddedPages.length % 4 !== 0 && paddedPages.length > 0) {
        paddedPages.push(null);
    }
    n = paddedPages.length;

    const bookletOrderNodes: (HTMLDivElement | null)[] = [];
    if (n > 0) {
        for (let i = 0; i < n / 2; i++) {
            if (i % 2 === 0) {
                bookletOrderNodes.push(paddedPages[n - 1 - i]);
                bookletOrderNodes.push(paddedPages[i]);
            } else {
                bookletOrderNodes.push(paddedPages[i]);
                bookletOrderNodes.push(paddedPages[n - 1 - i]);
            }
        }
    }


    const a4Width = 842; // A4 landscape width in points
    const a4Height = 595; // A4 landscape height in points
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4',
    });

    const singlePageWidth = a4Width / 2;
    const singlePageHeight = a4Height;

    const captureNode = async (node: HTMLDivElement | null) => {
        if (!node) {
             const blankCanvas = document.createElement('canvas');
             blankCanvas.width = singlePageWidth * 2;
             blankCanvas.height = singlePageHeight * 2;
             const ctx = blankCanvas.getContext('2d');
             if(ctx){
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, blankCanvas.width, blankCanvas.height);
             }
             return blankCanvas;
        }

        const clonedNode = node.cloneNode(true) as HTMLDivElement;
        clonedNode.style.position = 'absolute';
        clonedNode.style.left = '-9999px';
        clonedNode.style.top = '0px';
        document.body.appendChild(clonedNode);
        
        const canvas = await html2canvas(clonedNode, { scale: 2 });
        
        document.body.removeChild(clonedNode);
        
        return canvas;
    };


    for (let i = 0; i < bookletOrderNodes.length; i += 2) {
        const leftNode = bookletOrderNodes[i];
        const rightNode = bookletOrderNodes[i + 1];

        const leftCanvas = await captureNode(leftNode);
        const rightCanvas = await captureNode(rightNode);
        
        pdf.addImage(leftCanvas.toDataURL('image/png'), 'PNG', 0, 0, singlePageWidth, singlePageHeight);
        pdf.addImage(rightCanvas.toDataURL('image/png'), 'PNG', singlePageWidth, 0, singlePageWidth, singlePageHeight);

        if (i + 2 < bookletOrderNodes.length) {
            pdf.addPage();
        }
    }

    pdf.save('question-paper-booklet.pdf');
  };

  const handlePaperDetailChange = (field: keyof Paper, value: string | number) => {
    setPaper(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const handleQuestionChange = (id: string, field: keyof Question, value: string | number | NumberingFormat) => {
    setPaper(prev => {
        if (!prev) return null;
        return produce(prev, draft => {
            const question = draft.questions.find(q => q.id === id);
            if (question) {
                (question as any)[field] = value;
            }
        });
    });
  };
  
    const handleSubQuestionChange = (parentId: string, subId: string, field: keyof Question, value: string | number) => {
        setPaper(prev => {
            if (!prev) return null;
            return produce(prev, draft => {
                const parentQuestion = draft.questions.find(q => q.id === parentId);
                if (parentQuestion && parentQuestion.subQuestions) {
                    const subQuestion = parentQuestion.subQuestions.find(sq => sq.id === subId);
                    if (subQuestion) {
                        (subQuestion as any)[field] = value;
                    }
                }
            });
        });
      };
  
  const addSubQuestion = (questionId: string, type: Question['type'] = 'short') => {
    setPaper(prev => {
        if (!prev) return null;
        return produce(prev, draft => {
            const question = draft.questions.find(q => q.id === questionId);
            if (question) {
                const newSubQuestion: Question = {
                    id: generateId('sq_'),
                    type: type,
                    content: 'নতুন প্রশ্ন...',
                    marks: 1,
                };
                if (type === 'mcq') {
                    newSubQuestion.options = [
                        { id: generateId('opt_'), text: 'অপশন ১' },
                        { id: generateId('opt_'), text: 'অপশন ২' },
                        { id: generateId('opt_'), text: 'অপশন ৩' },
                        { id: generateId('opt_'), text: 'অপশন ৪' },
                    ];
                }
                if (!question.subQuestions) {
                    question.subQuestions = [];
                }
                question.subQuestions.push(newSubQuestion);
            }
        });
    });
  };
  
  const removeSubQuestion = (questionId: string, subQuestionId: string) => {
    setPaper(prev => {
        if (!prev) return null;
        return produce(prev, draft => {
            const question = draft.questions.find(q => q.id === questionId);
            if (question && question.subQuestions) {
                question.subQuestions = question.subQuestions.filter(sq => sq.id !== subQuestionId);
            }
        });
    });
  };

  const addOption = (questionId: string, subQuestionId: string) => {
    setPaper(prev => {
        if (!prev) return null;
        return produce(prev, draft => {
            const q = draft.questions.find(q => q.id === questionId);
            if (q && q.subQuestions) {
                const sq = q.subQuestions.find(sq => sq.id === subQuestionId);
                if (sq) {
                    const newOption = { id: generateId('opt_'), text: 'নতুন অপশন' };
                     if (!sq.options) {
                        sq.options = [];
                    }
                    sq.options.push(newOption);
                }
            }
        });
    });
  };

  const removeOption = (questionId: string, subQuestionId: string, optionId: string) => {
    setPaper(prev => {
        if (!prev) return null;
        return produce(prev, draft => {
            const q = draft.questions.find(q => q.id === questionId);
             if (q && q.subQuestions) {
                const sq = q.subQuestions.find(sq => sq.id === subQuestionId);
                if (sq && sq.options) {
                    sq.options = sq.options.filter(opt => opt.id !== optionId);
                }
            }
        });
    });
  };

  const handleOptionChange = (questionId: string, subQuestionId: string, optionId: string, text: string) => {
    setPaper(prev => {
        if (!prev) return null;
        return produce(prev, draft => {
            const q = draft.questions.find(q => q.id === questionId);
            if (q && q.subQuestions) {
                const sq = q.subQuestions.find(sq => sq.id === subQuestionId);
                if (sq && sq.options) {
                    const opt = sq.options.find(opt => opt.id === optionId);
                    if (opt) {
                        opt.text = text;
                    }
                }
            }
        });
    });
  };

  const handleTableCellChange = (questionId: string, rowIndex: number, colIndex: number, value: string) => {
    setPaper(prev => {
        if (!prev) return null;
        return produce(prev, draft => {
            const q = draft.questions.find(q => q.id === questionId);
            if (q && q.tableData) {
                q.tableData[rowIndex][colIndex] = value;
            }
        });
    });
  };
  
  const addRow = (questionId: string) => {
    setPaper(prev => {
        if (!prev) return null;
        return produce(prev, draft => {
            const q = draft.questions.find(q => q.id === questionId);
            if (q) {
                const newRow = Array(q.cols || 1).fill('');
                if (!q.tableData) q.tableData = [];
                q.tableData.push(newRow);
                q.rows = (q.rows || 0) + 1;
            }
        });
    });
  };
  
  const removeRow = (questionId: string) => {
    setPaper(prev => {
        if (!prev) return null;
        return produce(prev, draft => {
            const q = draft.questions.find(q => q.id === questionId);
            if (q && q.tableData && q.rows && q.rows > 1) {
                q.tableData.pop();
                q.rows -= 1;
            }
        });
    });
  };
  
  const addCol = (questionId: string) => {
    setPaper(prev => {
        if (!prev) return null;
        return produce(prev, draft => {
            const q = draft.questions.find(q => q.id === questionId);
            if (q) {
                if (!q.tableData) q.tableData = [[]];
                q.tableData.forEach(row => row.push(''));
                q.cols = (q.cols || 0) + 1;
            }
        });
    });
  };
  
  const removeCol = (questionId: string) => {
    setPaper(prev => {
        if (!prev) return null;
        return produce(prev, draft => {
            const q = draft.questions.find(q => q.id === questionId);
            if (q && q.tableData && q.cols && q.cols > 1) {
                q.tableData.forEach(row => row.pop());
                q.cols -= 1;
            }
        });
    });
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

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    setPaper(prev => {
        if (!prev) return null;
        return produce(prev, draft => {
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= draft.questions.length) {
                return;
            }
            const [movedQuestion] = draft.questions.splice(index, 1);
            draft.questions.splice(newIndex, 0, movedQuestion);
        });
    });
  };

  const removeQuestion = (id: string) => {
    setPaper(prev => {
        if (!prev) return null;
        return produce(prev, draft => {
            draft.questions = draft.questions.filter(q => q.id !== id);
        });
    });
  };

  const QuestionActions = ({ index }: { index: number }) => (
    <div className="absolute top-0 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
       <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveQuestion(index, 'up')} disabled={index === 0}>
        <ArrowUp className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveQuestion(index, 'down')} disabled={!paper || index === paper.questions.length - 1}>
        <ArrowDown className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => paper && removeQuestion(paper.questions[index].id)}>
        <Trash2 className="size-4" />
      </Button>
    </div>
  );

  const renderQuestion = (question: Question, index: number) => {
    if (!paper) return null;
    const isContainer = ['passage', 'fill-in-the-blanks', 'short', 'mcq', 'essay', 'creative'].includes(question.type);
    
    const questionNumber = paper.questions.slice(0, index + 1).filter(q => q.type !== 'section-header').length;

    if (question.type === 'section-header') {
        return (
            <Card key={question.id} className="group relative p-4 bg-slate-100">
                 <QuestionActions index={index} />
                 <Input 
                    value={question.content}
                    onChange={(e) => handleQuestionChange(question.id, 'content', e.target.value)}
                    className="text-center font-bold underline decoration-dotted text-lg border-0 focus-visible:ring-0 shadow-none bg-transparent"
                 />
            </Card>
        )
    }

    const questionCard = (children: React.ReactNode) => (
        <Card key={question.id} className="group relative p-4 space-y-3 bg-slate-50">
          <QuestionActions index={index} />
          <div className="flex items-start justify-between">
            <Label className="font-bold pt-1.5">{`${questionNumber}.`}</Label>
            <div className="flex-1 ml-2">
                <Textarea
                    value={question.content}
                    onChange={(e) => handleQuestionChange(question.id, 'content', e.target.value)}
                    onFocus={(e) => handleFocus(e, question.id)}
                    className="bg-white font-semibold"
                    rows={1}
                />
            </div>
          </div>
            <div className="flex items-center gap-4 pl-8">
              { question.type !== 'creative' && (
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
              )}
              { isContainer && (
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
              )}
            </div>
          {children}
        </Card>
      );

      const subQuestionRenderer = (qType: Question['type']) => (
        <>
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
                    { question.type === 'creative' && sq.marks !== undefined && (
                       <div className="flex items-center gap-2 shrink-0">
                         <Label htmlFor={`marks-${sq.id}`} className="text-sm">Marks:</Label>
                         <Input 
                           id={`marks-${sq.id}`}
                           type="number" 
                           value={sq.marks} 
                           onChange={(e) => handleSubQuestionChange(question.id, sq.id, 'marks', Number(e.target.value))}
                           className="w-20 h-8"
                           placeholder="Marks"
                         />
                      </div>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => removeSubQuestion(question.id, sq.id)}>
                        <Trash2 className="size-4" />
                    </Button>
                  </div>
                  {sq.type === 'mcq' && (
                    <div className="pl-8 space-y-2 group/sub">
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
            return questionCard(subQuestionRenderer('short'));
        case 'creative':
            return questionCard(subQuestionRenderer('short'));
        case 'fill-in-the-blanks':
             return questionCard(subQuestionRenderer('fill-in-the-blanks'));
        case 'short':
          return questionCard(subQuestionRenderer('short'));
        case 'essay':
          return questionCard(subQuestionRenderer('essay'));
        case 'mcq':
             return questionCard(subQuestionRenderer('mcq'));
        case 'table':
            return questionCard((
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
              ));
        default:
            return null;
    }
  }

  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: generateId('q_'),
      type: type,
      content: '',
      marks: 5,
    };
    
    if (type === 'section-header') {
        newQuestion.content = 'ক বিভাগ';
        delete newQuestion.marks;
    }

    if (type === 'passage' || type === 'short' || type === 'essay' || type === 'fill-in-the-blanks' || type === 'mcq' || type === 'creative') {
      newQuestion.subQuestions = [];
      newQuestion.numberingFormat = 'bangla-alpha';
  
      switch (type) {
        case 'passage':
          newQuestion.content = 'নিচের অনুচ্ছেদটি পড় এবং প্রশ্নগুলোর উত্তর দাও:';
          newQuestion.marks = 10;
          newQuestion.subQuestions.push({ id: generateId('sq_'), type: 'short', content: 'নতুন প্রশ্ন...', marks: 2});
          break;
        case 'creative':
          newQuestion.content = 'নিচের উদ্দীপকটি পড় এবং প্রশ্নগুলোর উত্তর দাও:';
          delete newQuestion.marks;
          newQuestion.subQuestions.push({ id: generateId('sq_'), type: 'short', content: 'জ্ঞানমূলক', marks: 1});
          newQuestion.subQuestions.push({ id: generateId('sq_'), type: 'short', content: 'অনুধাবনমূলক', marks: 2});
          newQuestion.subQuestions.push({ id: generateId('sq_'), type: 'short', content: 'প্রয়োগমূলক', marks: 3});
          newQuestion.subQuestions.push({ id: generateId('sq_'), type: 'short', content: 'উচ্চতর দক্ষতামূলক', marks: 4});
          break;
        case 'fill-in-the-blanks':
          newQuestion.content = 'খালি জায়গা পূরণ কর:';
          newQuestion.marks = 5;
          newQuestion.subQuestions.push({ id: generateId('sq_'), type: 'fill-in-the-blanks', content: 'নতুন লাইন...', marks: 1});
          break;
        case 'short':
          newQuestion.content = 'নিচের প্রশ্নগুলোর উত্তর দাও:';
          newQuestion.marks = 10;
          newQuestion.subQuestions.push({ id: generateId('sq_'), type: 'short', content: 'নতুন প্রশ্ন...', marks: 2});
          break;
        case 'essay':
          newQuestion.content = 'নিচের প্রশ্নগুলোর উত্তর দাও:';
          newQuestion.marks = 20;
          newQuestion.subQuestions.push({ id: generateId('sq_'), type: 'essay', content: 'নতুন রচনামূলক প্রশ্ন...', marks: 10});
          break;
        case 'mcq':
            newQuestion.content = 'সঠিক উত্তরটি বেছে নাও:';
            newQuestion.marks = 10;
            newQuestion.numberingFormat = 'bangla-numeric';
            newQuestion.subQuestions.push({
                id: generateId('sq_'),
                type: 'mcq',
                content: 'নতুন MCQ প্রশ্ন...',
                marks: 1,
                options: [
                    { id: generateId('opt_'), text: 'অপশন ১' },
                    { id: generateId('opt_'), text: 'অপশন ২' },
                    { id: generateId('opt_'), text: 'অপশন ৩' },
                    { id: generateId('opt_'), text: 'অপশন ৪' },
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

    setPaper(prev => {
      if (!prev) return null;
      return produce(prev, draft => {
        draft.questions.push(newQuestion);
      });
    });
  };


  const addNote = () => {
    if(paper) handlePaperDetailChange('notes', '(ক ও খ বিভাগ থেকে দুটি এবং গ ও ঘ বিভাগ থেকে ১টি সহ মোট ৭ টি প্রশ্নের উত্তর দাও)');
  };
  
  if (!paper) {
      return (
          <div className="flex h-screen items-center justify-center">
              <p>Loading paper...</p>
          </div>
      );
  }

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
                <div className="flex-1 overflow-auto bg-gray-100 p-4" ref={previewContainerRef}>
                  <PaperPreview paper={paper} />
                </div>
                <DialogFooter>
                    <Button onClick={handleDownloadPdf}><Download className="mr-2 size-4" /> Download PDF</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
              <div className="pt-2">
                {paper.notes === undefined ? (
                    <Button variant="outline" size="sm" onClick={addNote}>
                        <Plus className="mr-2 size-4" /> নোট যোগ করুন
                    </Button>
                ) : (
                    <Textarea 
                        value={paper.notes}
                        onChange={e => handlePaperDetailChange('notes', e.target.value)}
                        placeholder="নোট লিখুন..."
                        className="bg-slate-50 text-sm text-center"
                    />
                )}
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
                    <Button variant="outline" onClick={() => addQuestion('section-header')}><Minus className="mr-2 size-4" /> বিভাগ যোগ করুন</Button>
                    <Button variant="outline" onClick={() => addQuestion('creative')}><BookMarked className="mr-2 size-4" /> সৃজনশীল প্রশ্ন</Button>
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
