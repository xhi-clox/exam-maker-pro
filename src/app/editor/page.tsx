
'use client';
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
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
import { Plus, Type, Pilcrow, Image as ImageIcon, Download, Eye, Trash2, ArrowUp, ArrowDown, ListOrdered, TableIcon, PlusCircle, MinusCircle, BookMarked, Minus, Sparkles, Save, Settings } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import PaperPreview, { PaperPage, type PaperSettings, type PageContent } from './PaperPreview';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import MathExpressions from './MathExpressions';
import { produce } from 'immer';
import { createRoot } from 'react-dom/client';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

const generateId = (prefix: string) => {
    return `${prefix}${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
};

const ensureUniqueIds = (questions: Question[]): Question[] => {
    const seenIds = new Set<string>();

    return produce(questions, draft => {
      const processNode = (node: any, prefix: string) => {
        let newId = node.id && !node.id.includes('undefined') && !seenIds.has(node.id) ? node.id : generateId(prefix);
        while(seenIds.has(newId)) {
            newId = generateId(prefix);
        }
        node.id = newId;
        seenIds.add(newId);
  
        if (node.options) {
          node.options.forEach((option: any) => processNode(option, 'opt_'));
        }
        if (node.subQuestions) {
          node.subQuestions.forEach((sub: any) => processNode(sub, 'sq_'));
        }
      };
  
      draft.forEach(q => processNode(q, 'q_'));
    });
};


export type NumberingFormat = 'bangla-alpha' | 'bangla-numeric' | 'roman';

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
  timeAllowed: string;
  totalMarks: number;
  questions: Question[];
  notes?: string;
}

const initialPaperData: Paper = {
  schoolName: 'ABC GOVT. School and College',
  examTitle: 'Annual Examination-2025',
  subject: 'Bangla',
  grade: '9',
  timeAllowed: '3 Hours',
  totalMarks: 100,
  questions: [],
};


export default function EditorPage() {
  const [paper, setPaper] = useState<Paper | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // This effect runs once on mount to initialize the paper state.
    const savedPaper = localStorage.getItem('currentPaper');
    let initialData = initialPaperData;
    if (savedPaper) {
        try {
            initialData = JSON.parse(savedPaper);
        } catch (e) {
            console.error("Failed to parse saved paper from localStorage", e);
        }
    }
    const questionsWithUniqueIds = ensureUniqueIds(initialData.questions || []);
    setPaper({ ...initialData, questions: questionsWithUniqueIds });
  }, []);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [focusedInput, setFocusedInput] = useState<{ element: HTMLTextAreaElement | HTMLInputElement; id: string } | null>(null);
  
  const [pages, setPages] = useState<PageContent[][]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [bookletPages, setBookletPages] = useState<{left: string|null; right: string|null}[]>([]);
  const hiddenRenderRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<PaperSettings>({ 
    margins: { top: 10, bottom: 10, left: 10, right: 10 },
    width: 560, 
    height: 794,
    fontSize: 12,
    lineHeight: 1.4,
  });

  const handleSaveAndExit = () => {
    if (paper) {
      try {
        localStorage.setItem('currentPaper', JSON.stringify(paper));
        toast({
          title: "Progress Saved",
          description: "Your question paper has been saved locally.",
        });
        router.push('/');
      } catch (e) {
        console.error("Failed to save paper to localStorage", e);
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: "Could not save your paper. Please try again.",
        });
      }
    }
  };

  // Import effect
  useEffect(() => {
    const from = searchParams.get('from');
    if ((from === 'image' || from === 'suggest') && paper) {
      const data = localStorage.getItem('newImageData');
      if (data) {
        try {
          const parsedData = JSON.parse(data);
          
          setPaper(currentPaper => {
            if (!currentPaper) return null;
            
            const newQuestions = parsedData.questions ? ensureUniqueIds(parsedData.questions) : [];
            
            return produce(currentPaper, draft => {
              draft.questions.push(...newQuestions);
            });
          });

        } catch (e) {
          console.error("Failed to parse or append paper data from localStorage", e);
        } finally {
          localStorage.removeItem('newImageData');
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

    const event = new Event('input', { bubbles: true });
    element.dispatchEvent(event);
  };

  const generatePdf = async () => {
    if (!paper || bookletPages.length === 0) return;
    
    const a4Width = 842; 
    const a4Height = 595;
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4',
    });

    const addImageToPdf = async (canvasDataUrl: string | null, x: number) => {
        if (!canvasDataUrl) return;
        await new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
            try {
                const a4HalfWidth = a4Width / 2;
                const a4HalfHeight = a4Height;
        
                const scale = Math.min(a4HalfWidth / img.naturalWidth, a4HalfHeight / img.naturalHeight);
                const drawWidth = img.naturalWidth * scale;
                const drawHeight = img.naturalHeight * scale;
        
                const drawX = x + (a4HalfWidth - drawWidth) / 2;
                const drawY = (a4HalfHeight - drawHeight) / 2;
        
                pdf.addImage(img, 'PNG', drawX, drawY, drawWidth, drawHeight);
                resolve();
            } catch (e) {
                reject(e);
            }
            };
            img.onerror = (e) => reject(e);
            img.src = canvasDataUrl;
        });
    };

    for (let i = 0; i < bookletPages.length; i++) {
        if (i > 0) {
            pdf.addPage();
        }
        const bookletPage = bookletPages[i];
        await addImageToPdf(bookletPage.left, 0);
        await addImageToPdf(bookletPage.right, a4Width / 2);
    }
    
    pdf.save('question-paper-booklet.pdf');
    setIsDownloading(false);
    setBookletPages([]);
  };

  const preparePdfDownload = async () => {
    if (!paper || pages.length === 0) return;
    
    setIsDownloading(true);
    setBookletPages([]);

    const captureNode = async (pageIndex: number | null): Promise<string | null> => {
        if (pageIndex === null || !paper) return null;
        const pageContent = pages[pageIndex];
        if (!pageContent) return null;
    
        const mmToPx = (mm: number) => mm * 3.7795275591;
    
        const printCSS = `
            * { box-sizing: border-box; }
            html, body { margin: 0; padding: 0; }
            .pdf-render-root {
            width: ${settings.width}px;
            min-height: ${settings.height}px;
            font-family: "PT Sans", "Noto Sans Bengali", Arial, sans-serif;
            font-size: ${settings.fontSize}pt;
            line-height: ${settings.lineHeight};
            margin: 0;
            padding: ${mmToPx(settings.margins.top)}px ${mmToPx(settings.margins.right)}px ${mmToPx(settings.margins.bottom)}px ${mmToPx(settings.margins.left)}px;
            background: #fff;
            color: #000;
            }
            .pdf-render-root p { margin: 0 0 4px 0; }
            .pdf-render-root h1,h2,h3 { margin: 0 0 6px 0; }
            .pdf-render-root ul, .pdf-render-root ol { margin: 0 0 6px 1.2em; padding: 0; }
            .pdf-render-root textarea, .pdf-render-root input { font-family: inherit; font-size: inherit; }
        `;
    
        const pageContainer = document.createElement('div');
        pageContainer.style.position = 'absolute';
        pageContainer.style.left = '-9999px';
        pageContainer.style.top = '0';
        document.body.appendChild(pageContainer);
    
        let root = null as any;
        try {
            const styleEl = document.createElement('style');
            styleEl.textContent = printCSS;
            pageContainer.appendChild(styleEl);
    
            const wrapper = document.createElement('div');
            wrapper.className = 'pdf-render-root';
            pageContainer.appendChild(wrapper);
    
            const nodeToRender = (
            <PaperPage
                paper={paper}
                pageContent={pageContent}
                isFirstPage={pageIndex === 0}
                settings={settings}
                allQuestions={paper.questions}
            />
            );
    
            root = createRoot(wrapper);
            root.render(nodeToRender);
    
            if ((document as any).fonts && (document as any).fonts.ready) {
                try { await (document as any).fonts.ready; } catch(e) { /* ignore */ }
            }
    
            const imgs = wrapper.querySelectorAll('img');
            if (imgs.length > 0) {
            await Promise.all(Array.from(imgs).map((img) => {
                const i = img as HTMLImageElement;
                if (i.complete) return Promise.resolve();
                return new Promise<void>(res => { i.onload = i.onerror = () => res(); });
            }));
            }
            
            await new Promise(r => setTimeout(r, 50));
    
            const canvas = await html2canvas(wrapper as HTMLElement, {
                scale: 2,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#fff',
            });
    
            return canvas.toDataURL('image/png');
        } catch (err) {
            console.error('captureNode error:', err);
            return null;
        } finally {
            try {
                if (root) root.unmount();
            } catch (_) {}
            if (pageContainer.parentNode) pageContainer.parentNode.removeChild(pageContainer);
        }
    };
  
    let n = pages.length;
    const paddedPageIndices: (number | null)[] = [...Array(n).keys()];
    while (paddedPageIndices.length % 4 !== 0 && paddedPageIndices.length > 0) {
      paddedPageIndices.push(null);
    }
    n = paddedPageIndices.length;
  
    const bookletOrderIndices: (number | null)[] = [];
    if (n > 0) {
      for (let i = 0; i < n / 2; i++) {
        if (i % 2 === 0) {
          bookletOrderIndices.push(paddedPageIndices[n - 1 - i]);
          bookletOrderIndices.push(paddedPageIndices[i]);
        } else {
          bookletOrderIndices.push(paddedPageIndices[i]);
          bookletOrderIndices.push(paddedPageIndices[n - 1 - i]);
        }
      }
    }
  
    try {
        const finalBookletPages = [];
        for (let i = 0; i < bookletOrderIndices.length; i += 2) {
          const leftPageIndex = bookletOrderIndices[i];
          const rightPageIndex = bookletOrderIndices[i + 1];
      
          const [leftCanvasUrl, rightCanvasUrl] = await Promise.all([
              captureNode(leftPageIndex),
              captureNode(rightPageIndex),
          ]);
          
          finalBookletPages.push({ left: leftCanvasUrl, right: rightCanvasUrl });
        }
        setBookletPages(finalBookletPages);
    } catch(e) {
        console.error("Failed to prepare PDF download", e);
        setIsDownloading(false);
    }
  };


  const handlePaperDetailChange = (field: keyof Paper, value: string | number) => {
    setPaper(prev => produce(prev, draft => {
        if(draft) (draft as any)[field] = value
    }));
  };

  const handleQuestionChange = (id: string, field: keyof Question, value: any) => {
    setPaper(prev => produce(prev, draft => {
        if (!draft) return;
        const question = draft.questions.find(q => q.id === id);
        if (question) {
            (question as any)[field] = value;
        }
    }));
  };
  
    const handleSubQuestionChange = (parentId: string, subId: string, field: keyof Question, value: any) => {
        setPaper(prev => produce(prev, draft => {
            if (!draft) return;
            const parentQuestion = draft.questions.find(q => q.id === parentId);
            if (parentQuestion && parentQuestion.subQuestions) {
                const subQuestion = parentQuestion.subQuestions.find(sq => sq.id === subId);
                if (subQuestion) {
                    (subQuestion as any)[field] = value;
                }
            }
        }));
      };
  
  const addSubQuestion = (questionId: string, type: Question['type'] = 'short') => {
    setPaper(prev => produce(prev, draft => {
        if (!draft) return;
        const question = draft.questions.find(q => q.id === questionId);
        if (question) {
            const newSubQuestion: Question = {
                id: generateId('sq'),
                type: type,
                content: 'নতুন প্রশ্ন...',
                marks: 1,
            };
            if (type === 'mcq') {
                newSubQuestion.options = [
                    { id: generateId('opt'), text: 'অপশন ১' },
                    { id: generateId('opt'), text: 'অপশন ২' },
                    { id: generateId('opt'), text: 'অপশন ৩' },
                    { id: generateId('opt'), text: 'অপশন ৪' },
                ];
            }
            if (!question.subQuestions) {
                question.subQuestions = [];
            }
            question.subQuestions.push(newSubQuestion);
        }
    }));
  };
  
  const removeSubQuestion = (questionId: string, subQuestionId: string) => {
    setPaper(prev => produce(prev, draft => {
        if (!draft) return;
        const question = draft.questions.find(q => q.id === questionId);
        if (question && question.subQuestions) {
            question.subQuestions = question.subQuestions.filter(sq => sq.id !== subQuestionId);
        }
    }));
  };

  const addOption = (questionId: string, subQuestionId: string) => {
    setPaper(prev => produce(prev, draft => {
        if (!draft) return;
        const q = draft.questions.find(q => q.id === questionId);
        if (q && q.subQuestions) {
            const sq = q.subQuestions.find(sq => sq.id === subQuestionId);
            if (sq) {
                const newOption = { id: generateId('opt'), text: 'নতুন অপশন' };
                 if (!sq.options) {
                    sq.options = [];
                }
                sq.options.push(newOption);
            }
        }
    }));
  };

  const removeOption = (questionId: string, subQuestionId: string, optionId: string) => {
    setPaper(prev => produce(prev, draft => {
        if (!draft) return;
        const q = draft.questions.find(q => q.id === questionId);
         if (q && q.subQuestions) {
            const sq = q.subQuestions.find(sq => sq.id === subQuestionId);
            if (sq && sq.options) {
                sq.options = sq.options.filter(opt => opt.id !== optionId);
            }
        }
    }));
  };

  const handleOptionChange = (questionId: string, subQuestionId: string, optionId: string, text: string) => {
    setPaper(prev => produce(prev, draft => {
        if (!draft) return;
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
    }));
  };

  const handleTableCellChange = (questionId: string, rowIndex: number, colIndex: number, value: string) => {
    setPaper(prev => produce(prev, draft => {
        if (!draft) return;
        const q = draft.questions.find(q => q.id === questionId);
        if (q && q.tableData) {
            q.tableData[rowIndex][colIndex] = value;
        }
    }));
  };
  
  const addRow = (questionId: string) => {
    setPaper(prev => produce(prev, draft => {
        if (!draft) return;
        const q = draft.questions.find(q => q.id === questionId);
        if (q) {
            const newRow = Array(q.cols || 1).fill('');
            if (!q.tableData) q.tableData = [];
            q.tableData.push(newRow);
            q.rows = (q.rows || 0) + 1;
        }
    }));
  };
  
  const removeRow = (questionId: string) => {
    setPaper(prev => produce(prev, draft => {
        if (!draft) return;
        const q = draft.questions.find(q => q.id === questionId);
        if (q && q.tableData && q.rows && q.rows > 1) {
            q.tableData.pop();
            q.rows -= 1;
        }
    }));
  };
  
  const addCol = (questionId: string) => {
    setPaper(prev => produce(prev, draft => {
        if (!draft) return;
        const q = draft.questions.find(q => q.id === questionId);
        if (q) {
            if (!q.tableData) q.tableData = [[]];
            q.tableData.forEach(row => row.push(''));
            q.cols = (q.cols || 0) + 1;
        }
    }));
  };
  
  const removeCol = (questionId: string) => {
    setPaper(prev => produce(prev, draft => {
        if (!draft) return;
        const q = draft.questions.find(q => q.id === questionId);
        if (q && q.tableData && q.cols && q.cols > 1) {
            q.tableData.forEach(row => row.pop());
            q.cols -= 1;
        }
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

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    setPaper(prev => produce(prev, draft => {
        if (!draft) return;
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= draft.questions.length) {
            return;
        }
        const [movedQuestion] = draft.questions.splice(index, 1);
        draft.questions.splice(newIndex, 0, movedQuestion);
    }));
  };

  const removeQuestion = (id: string) => {
    setPaper(prev => produce(prev, draft => {
        if (!draft) return;
        draft.questions = draft.questions.filter(q => q.id !== id);
    }));
  };

  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: generateId('q'),
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
          newQuestion.subQuestions.push({ id: generateId('sq'), type: 'short', content: 'নতুন প্রশ্ন...', marks: 2});
          break;
        case 'creative':
          newQuestion.content = 'নিচের উদ্দীপকটি পড় এবং প্রশ্নগুলোর উত্তর দাও:';
          delete newQuestion.marks;
          newQuestion.subQuestions.push({ id: generateId('sq'), type: 'short', content: 'জ্ঞানমূলক', marks: 1});
          newQuestion.subQuestions.push({ id: generateId('sq'), type: 'short', content: 'অনুধাবনমূলক', marks: 2});
          newQuestion.subQuestions.push({ id: generateId('sq'), type: 'short', content: 'প্রয়োগমূলক', marks: 3});
          newQuestion.subQuestions.push({ id: generateId('sq'), type: 'short', content: 'উচ্চতর দক্ষতামূলক', marks: 4});
          break;
        case 'fill-in-the-blanks':
          newQuestion.content = 'খালি জায়গা পূরণ কর:';
          newQuestion.marks = 5;
          newQuestion.subQuestions.push({ id: generateId('sq'), type: 'fill-in-the-blanks', content: 'নতুন লাইন...', marks: 1});
          break;
        case 'short':
          newQuestion.content = 'নিচের প্রশ্নগুলোর উত্তর দাও:';
          newQuestion.marks = 10;
          newQuestion.subQuestions.push({ id: generateId('sq'), type: 'short', content: 'নতুন প্রশ্ন...', marks: 2});
          break;
        case 'essay':
          newQuestion.content = 'নিচের প্রশ্নগুলোর উত্তর দাও:';
          newQuestion.marks = 20;
          newQuestion.subQuestions.push({ id: generateId('sq'), type: 'essay', content: 'নতুন রচনামূলক প্রশ্ন...', marks: 10});
          break;
        case 'mcq':
            newQuestion.content = 'সঠিক উত্তরটি বেছে নাও:';
            newQuestion.marks = 10;
            newQuestion.numberingFormat = 'bangla-numeric';
            newQuestion.subQuestions.push({
                id: generateId('sq'),
                type: 'mcq',
                content: 'নতুন MCQ প্রশ্ন...',
                marks: 1,
                options: [
                    { id: generateId('opt'), text: 'অপশন ১' },
                    { id: generateId('opt'), text: 'অপশন ২' },
                    { id: generateId('opt'), text: 'অপশন ৩' },
                    { id: generateId('opt'), text: 'অপশন ৪' },
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

    setPaper(prev => produce(prev, draft => {
      if (!draft) return;
      draft.questions.push(newQuestion);
    }));
  };

  const addNote = () => {
    if(paper) handlePaperDetailChange('notes', '(ক ও খ বিভাগ থেকে দুটি এবং গ ও ঘ বিভাগ থেকে ১টি সহ মোট ৭ টি প্রশ্নের উত্তর দাও)');
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
            <Card key={question.id} className="group relative p-4 bg-slate-100 dark:bg-slate-800">
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
        <Card key={question.id} className="group relative p-4 space-y-3 bg-slate-50 dark:bg-slate-900">
          <QuestionActions index={index} />
          <div className="flex items-start justify-between">
            <Label className="font-bold pt-1.5">{`${questionNumber}.`}</Label>
            <div className="flex-1 ml-2">
                <Textarea
                    value={question.content}
                    onInput={(e) => handleQuestionChange(question.id, 'content', (e.target as HTMLTextAreaElement).value)}
                    onFocus={(e) => handleFocus(e, question.id)}
                    className="bg-white dark:bg-slate-800 font-semibold"
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
                      value={question.marks || ''} 
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
                        onInput={(e) => handleSubQuestionChange(question.id, sq.id, 'content', (e.target as HTMLTextAreaElement).value)}
                        onFocus={(e) => handleFocus(e, `${question.id}-${sq.id}`)}
                        className="flex-grow bg-white dark:bg-slate-800" />
                    { question.type === 'creative' && sq.marks !== undefined && (
                       <div className="flex items-center gap-2 shrink-0">
                         <Label htmlFor={`marks-${sq.id}`} className="text-sm">Marks:</Label>
                         <Input 
                           id={`marks-${sq.id}`}
                           type="number" 
                           value={sq.marks || ''} 
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
                                <span className="font-semibold">{getNumbering('bangla-alpha', optIndex)}</span>
                                <Input 
                                    value={opt.text}
                                    onInput={(e) => handleOptionChange(question.id, sq.id, opt.id, (e.target as HTMLInputElement).value)}
                                    onFocus={(e) => handleFocus(e, `option-${question.id}-${sq.id}-${opt.id}`)}
                                    className="bg-white dark:bg-slate-800"
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
                    onInput={(e) => handleQuestionChange(question.id, 'content', (e.target as HTMLTextAreaElement).value)}
                    onFocus={(e) => handleFocus(e, question.id)}
                    className="bg-white dark:bg-slate-800 mb-4"
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
                                  className="w-full h-full border-0 rounded-none focus-visible:ring-1 ring-inset focus-visible:ring-blue-400 bg-white dark:bg-slate-800"
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

  useLayoutEffect(() => {
    if (!paper) return;
    let cancelled = false;
  
    const calculatePages = async () => {
      if (!hiddenRenderRef.current) {
        setPages([]);
        return;
      }
      
      const tempRenderContainer = document.createElement('div');
      hiddenRenderRef.current.appendChild(tempRenderContainer);
      const root = createRoot(tempRenderContainer);
      
      try {
        root.render((
          <PaperPage
            paper={paper}
            pageContent={paper.questions.map(q => ({ mainQuestion: q, subQuestions: q.subQuestions || [], showMainContent: true }))}
            isFirstPage={true}
            settings={settings}
            allQuestions={paper.questions}
          />
        ));
    
        if ((document as any).fonts && (document as any).fonts.ready) {
            try { await (document as any).fonts.ready; } catch(_) {}
        }
        await new Promise(r => setTimeout(r, 60));
    
        if (cancelled) return;
    
        const renderedPaperPage = tempRenderContainer.querySelector('.paper-page') as HTMLElement | null;
        if (!renderedPaperPage) return;
    
        const allQuestionElements = Array.from(renderedPaperPage.querySelectorAll<HTMLElement>('[data-question-id]'));
    
        const headerEl = renderedPaperPage.querySelector<HTMLElement>('.preview-header');
        let headerHeight = 0;
        if (headerEl) {
            const style = window.getComputedStyle(headerEl);
            headerHeight = headerEl.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
        }

        const notesEl = renderedPaperPage.querySelector<HTMLElement>('.text-center.text-sm.font-semibold.mb-6');
        if(notesEl) headerHeight += notesEl.offsetHeight + parseFloat(window.getComputedStyle(notesEl).marginBottom);
        
        const flexLineEls = renderedPaperPage.querySelectorAll<HTMLElement>('.flex.justify-between.text-sm');
        flexLineEls.forEach(el => {
            headerHeight += el.offsetHeight + parseFloat(window.getComputedStyle(el).marginBottom);
        });

        const newPages: PageContent[][] = [];
        let currentPageContent: PageContent[] = [];
        let currentPageHeight = 0;
        let isFirstPage = true;
        const pageBreakThreshold = settings.height - (settings.margins.top + settings.margins.bottom) * 3.7795275591;
  
        const startNewPage = () => {
          if (currentPageContent.length > 0) {
            newPages.push(currentPageContent);
          }
          currentPageContent = [];
          currentPageHeight = 0; // No header on subsequent pages
          isFirstPage = false;
        };
  
        if (isFirstPage) {
            currentPageHeight += headerHeight;
        }
  
        allQuestionElements.forEach((questionElement) => {
          const questionId = questionElement.dataset.questionId;
          const question = paper.questions.find(q => q.id === questionId);
          if (!question) return;
  
          const style = window.getComputedStyle(questionElement);
          const questionHeight = questionElement.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
  
          let availableHeight = pageBreakThreshold;
          
          if (currentPageHeight + questionHeight > availableHeight && currentPageContent.length > 0) {
            startNewPage();
          }
          
          const contentToAdd: PageContent = { mainQuestion: question, subQuestions: question.subQuestions || [], showMainContent: true };
          
          currentPageContent.push(contentToAdd);
          currentPageHeight += questionHeight;
        });
  
        if (currentPageContent.length > 0) {
          newPages.push(currentPageContent);
        }
        
        if (!cancelled) {
            setPages(newPages);
        }
      } finally {
        root.unmount();
        if (hiddenRenderRef.current?.contains(tempRenderContainer)) {
            hiddenRenderRef.current.removeChild(tempRenderContainer);
        }
      }
    };
  
    calculatePages();
  
    return () => { cancelled = true; };
  }, [paper, settings]);
  
  if (!paper) {
      return (
          <div className="flex h-screen items-center justify-center bg-background">
              <p>Loading paper...</p>
          </div>
      );
  }
  
  const headerInputStyle = "h-10 rounded-lg bg-slate-700/50 text-white placeholder:text-gray-500 border-slate-700 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:bg-slate-800/60 transition-colors";


  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-slate-800 px-4 sm:px-6">
        <div className="flex flex-1 justify-center">
            <div className="flex items-center gap-2">
              <Button onClick={handleSaveAndExit} variant="outline" className="text-white border-slate-600 hover:bg-slate-700 hover:text-white">
                <Save className="mr-2 size-4" /> Save & Exit
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-white border-slate-600 hover:bg-slate-700 hover:text-white"><Settings className="mr-2 size-4" /> Paper Settings</Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Paper Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Font Size: {settings.fontSize}pt</Label>
                        <Slider
                          value={[settings.fontSize]}
                          onValueChange={(value) => setSettings(s => ({...s, fontSize: value[0]}))}
                          min={8} max={18} step={1}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Line Spacing: {settings.lineHeight.toFixed(1)}</Label>
                        <Slider
                          value={[settings.lineHeight]}
                          onValueChange={(value) => setSettings(s => ({...s, lineHeight: value[0]}))}
                          min={1.0} max={2.5} step={0.1}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                      <div className="space-y-1">
                        <Label htmlFor="page-width" className="text-xs">Width (px)</Label>
                        <Input id="page-width" type="number" value={settings.width} onChange={e => setSettings(s => ({...s, width: parseInt(e.target.value) || 0}))} className="h-9 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-gray-400 border-slate-300 dark:border-slate-600 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:ring-2" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="page-height" className="text-xs">Height (px)</Label>
                        <Input id="page-height" type="number" value={settings.height} onChange={e => setSettings(s => ({...s, height: parseInt(e.target.value) || 0}))} className="h-9 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-gray-400 border-slate-300 dark:border-slate-600 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:ring-2" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="margin-top" className="text-xs">Top (mm)</Label>
                        <Input id="margin-top" type="number" value={settings.margins.top} onChange={e => setSettings(s => ({...s, margins: {...s.margins, top: parseInt(e.target.value) || 0}}))} className="h-9 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-gray-400 border-slate-300 dark:border-slate-600 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:ring-2"/>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="margin-bottom" className="text-xs">Bottom (mm)</Label>
                        <Input id="margin-bottom" type="number" value={settings.margins.bottom} onChange={e => setSettings(s => ({...s, margins: {...s.margins, bottom: parseInt(e.target.value) || 0}}))} className="h-9 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-gray-400 border-slate-300 dark:border-slate-600 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:ring-2"/>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="margin-left" className="text-xs">Left (mm)</Label>
                        <Input id="margin-left" type="number" value={settings.margins.left} onChange={e => setSettings(s => ({...s, margins: {...s.margins, left: parseInt(e.target.value) || 0}}))} className="h-9 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-gray-400 border-slate-300 dark:border-slate-600 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:ring-2"/>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="margin-right" className="text-xs">Right (mm)</Label>
                        <Input id="margin-right" type="number" value={settings.margins.right} onChange={e => setSettings(s => ({...s, margins: {...s.margins, right: parseInt(e.target.value) || 0}}))} className="h-9 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-gray-400 border-slate-300 dark:border-slate-600 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:ring-2"/>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-white border-slate-600 hover:bg-slate-700 hover:text-white"><Eye className="mr-2 size-4" /> Preview</Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col bg-slate-800 border-slate-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Question Paper Preview</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-auto bg-gray-100 p-4">
                    <PaperPreview 
                      paper={paper} 
                      pages={pages}
                      settings={settings}
                    />
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={isDownloading} onOpenChange={(open) => { if(!open) { setBookletPages([]); setIsDownloading(false); }}}>
                <DialogTrigger asChild>
                  <Button onClick={preparePdfDownload} className="bg-primary hover:bg-primary/90 text-primary-foreground"><Download className="mr-2 size-4" /> Download</Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl bg-slate-800 border-slate-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Booklet Download Preview</DialogTitle>
                  </DialogHeader>
                  <div className="my-4 overflow-x-auto">
                    {bookletPages.length > 0 ? (
                      <div className="flex gap-4 p-4 bg-gray-200">
                        {bookletPages.map((page, index) => (
                          <div key={index} className="flex-shrink-0 bg-white shadow-lg flex" style={{width: '842px', height: '595px'}}>
                            <div className="w-1/2 h-full border-r border-gray-300">
                              {page.left && <img src={page.left} alt={`Page ${index} Left`} className="w-full h-full object-contain" />}
                            </div>
                            <div className="w-1/2 h-full">
                              {page.right && <img src={page.right} alt={`Page ${index} Right`} className="w-full h-full object-contain" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-64">
                        <p>Generating PDF preview...</p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button onClick={generatePdf} disabled={bookletPages.length === 0}>Confirm and Download PDF</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-100 dark:bg-slate-900">
          <div className="max-w-4xl mx-auto">
              <div className="rounded-lg bg-white dark:bg-slate-800/50 p-6 space-y-6">
                  <div className="space-y-4">
                      <div className="space-y-1">
                          <Label htmlFor="schoolName" className="text-xs text-slate-500 dark:text-slate-400 px-1">School Name</Label>
                          <Input id="schoolName" className={`${headerInputStyle} text-lg text-center font-semibold`} value={paper.schoolName} onChange={e => handlePaperDetailChange('schoolName', e.target.value)} placeholder="School Name" />
                      </div>
                      <div className="space-y-1">
                          <Label htmlFor="examTitle" className="text-xs text-slate-500 dark:text-slate-400 px-1">Exam Title</Label>
                          <Input id="examTitle" className={`${headerInputStyle} text-center`} value={paper.examTitle} onChange={e => handlePaperDetailChange('examTitle', e.target.value)} placeholder="Exam Title" />
                      </div>
                  </div>

                  <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 text-sm">
                        <div className="space-y-1">
                            <Label htmlFor="subject" className="text-xs text-slate-500 dark:text-slate-400 px-1">Subject</Label>
                            <Input id="subject" className={headerInputStyle} value={paper.subject} onChange={e => handlePaperDetailChange('subject', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="grade" className="text-xs text-slate-500 dark:text-slate-400 px-1">Class</Label>
                            <Input id="grade" className={headerInputStyle} value={paper.grade} onChange={e => handlePaperDetailChange('grade', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="totalMarks" className="text-xs text-slate-500 dark:text-slate-400 px-1">Marks</Label>
                            <Input id="totalMarks" type="number" className={headerInputStyle} value={paper.totalMarks} onChange={e => handlePaperDetailChange('totalMarks', parseInt(e.target.value))}/>
                        </div>
                        <div className="space-y-1">
                              <Label htmlFor="timeAllowed" className="text-xs text-slate-500 dark:text-slate-400 px-1">Time</Label>
                              <Input id="timeAllowed" className={headerInputStyle} value={paper.timeAllowed} onChange={e => handlePaperDetailChange('timeAllowed', e.target.value)}/>
                        </div>
                    </div>
                    
                    <div className="pt-2 text-center">
                    {paper.notes === undefined ? (
                        <div className="text-center">
                            <Button 
                                variant="outline" 
                                onClick={addNote}
                                className={`${headerInputStyle} w-full`}
                            >
                                <Plus className="mr-2 size-4" />নোট যোগ করুন
                            </Button>
                        </div>
                    ) : (
                        <Textarea 
                            value={paper.notes}
                            onChange={e => handlePaperDetailChange('notes', e.target.value)}
                            placeholder="নোট লিখুন..."
                            className={`${headerInputStyle} text-sm text-center py-2.5 min-h-[40px] h-auto dark:text-white`}
                            rows={1}
                        />
                    )}
                    </div>
                  </div>
              </div>

              <div className="mt-6 space-y-4">
                  {paper.questions.length === 0 ? (
                  <div className="flex h-48 flex-col items-center justify-center text-center text-muted-foreground rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700">
                      <p className="font-semibold text-foreground">Your paper is empty</p>
                      <p className="text-sm">Add questions from the panel on the right.</p>
                  </div>
                  ) : (
                  <div className="space-y-4">
                      {paper.questions.map((q, index) => renderQuestion(q, index))}
                  </div>
                  )}
              </div>
          </div>
        </main>

        <aside className="w-[400px] flex-shrink-0 flex flex-col gap-6 overflow-y-auto bg-slate-800 p-4 pt-14">
            {/* Add Questions */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">প্রশ্ন যোগ করুন</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button variant="outline" onClick={() => addQuestion('section-header')} className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:text-white"><Minus className="mr-2 size-4" /> বিভাগ যোগ করুন</Button>
                <Button variant="outline" onClick={() => addQuestion('creative')} className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:text-white"><BookMarked className="mr-2 size-4" /> সৃজনশীল প্রশ্ন</Button>
                <Button variant="outline" onClick={() => addQuestion('passage')} className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:text-white"><Pilcrow className="mr-2 size-4" /> অনুচ্ছেদ</Button>
                <Button variant="outline" onClick={() => addQuestion('mcq')} className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:text-white"><ListOrdered className="mr-2 size-4" /> MCQ</Button>
                <Button variant="outline" onClick={() => addQuestion('short')} className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:text-white"><Type className="mr-2 size-4" /> সংক্ষিপ্ত প্রশ্ন</Button>
                <Button variant="outline" onClick={() => addQuestion('fill-in-the-blanks')} className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:text-white"><Type className="mr-2 size-4" /> শূন্যস্থান পূরণ</Button>
                <Button variant="outline" onClick={() => addQuestion('essay')} className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:text-white"><Pilcrow className="mr-2 size-4" /> রচনামূলক প্রশ্ন</Button>
                <Button variant="outline" onClick={() => addQuestion('table')} className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:text-white"><TableIcon className="mr-2 size-4" /> সারণী</Button>
                <Link href="/editor/image" passHref>
                    <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10"><ImageIcon className="mr-2 size-4" /> ছবি থেকে ইম্পোর্ট</Button>
                </Link>
                  <Link href="/ai/suggest" passHref>
                  <Button variant="outline" className="w-full border-purple-500 text-purple-500 hover:bg-purple-500/10">
                    <Sparkles className="mr-2 size-4" />
                    AI দিয়ে তৈরি করুন
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <MathExpressions onInsert={handleInsertExpression} />
        </aside>

        {/* Hidden div for calculations */}
        <div className="absolute top-0 left-[-9999px] opacity-0 pointer-events-none" style={{ width: `${settings.width}px` }}>
            <div ref={hiddenRenderRef}></div>
        </div>
      </div>
    </>
  );
}
