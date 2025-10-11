
'use client';

import React, { useRef } from 'react';
import type { Paper, Question, NumberingFormat } from './page';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const subjectMap: { [key: string]: string } = {
  bangla: 'বাংলা',
  english: 'English',
  math: 'গণিত',
  science: 'বিজ্ঞান',
};

const gradeMap: { [key: string]: string } = {
    '9': 'নবম',
    '10': 'দশম',
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

const renderQuestionContent = (question: Question, questionIndex: number, allQuestions: Question[], showMainContent: boolean) => {
    const originalQuestion = allQuestions.find(q => q.id === question.id);

    if (question.type === 'section-header') {
        return (
            <div key={question.id} className="text-center font-bold underline decoration-dotted text-lg my-4" data-question-id={question.id}>
                {showMainContent ? question.content : ''}
            </div>
        );
    }

    return (
      <div key={question.id} className="mb-4 question-item" data-question-id={question.id}>
        {showMainContent && (
            <div className="flex justify-between font-semibold question-content">
                <p className="flex-1">{questionIndex}. {question.content}</p>
                {question.type !== 'creative' && question.marks && question.marks > 0 && <p>{question.marks}</p>}
            </div>
        )}
  
        {question.subQuestions && question.subQuestions.length > 0 && (
          <div className="pl-6 mt-2 space-y-2">
            {question.subQuestions.map((sq) => {
              const sqIndex = originalQuestion?.subQuestions?.findIndex(osq => osq.id === sq.id) ?? -1;
              if (sqIndex === -1) return null;

              return (
                <div key={sq.id} className="subquestion-item" data-subquestion-id={sq.id}>
                  <div className="flex justify-between">
                    <p>{getNumbering(question.numberingFormat, sqIndex)}) {sq.content}</p>
                    {question.type === 'creative' && sq.marks && sq.marks > 0 && <p>{sq.marks}</p>}
                  </div>
                  {sq.options && sq.options.length > 0 && (
                    <div className="pl-6 mt-2 grid grid-cols-2 gap-x-8 gap-y-2">
                      {sq.options.map((option, optIndex) => (
                        <p key={option.id}>{getNumbering('bangla-alpha', optIndex)}) {option.text}</p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
  
        {question.type !== 'mcq' && question.options && question.options.length > 0 && (
          <div className="pl-6 mt-2 grid grid-cols-2 gap-x-8 gap-y-2">
            {question.options.map((option, optIndex) => (
              <p key={option.id}>{getNumbering('bangla-alpha', optIndex)}) {option.text}</p>
            ))}
          </div>
        )}
      </div>
    );
};

type PageContent = {
  mainQuestion: Question;
  subQuestions: Question[];
  showMainContent: boolean;
}

const PaperPage = React.forwardRef<HTMLDivElement, { paper: Paper; pageContent: PageContent[]; isFirstPage: boolean; settings: PaperSettings; allQuestions: Question[] }>(({ paper, pageContent, isFirstPage, settings, allQuestions }, ref) => {
    const getSubjectName = (subjectKey: string) => subjectMap[subjectKey] || subjectKey;
    const getGradeName = (gradeKey: string) => gradeMap[gradeKey] || gradeKey;
    
    const pageStyle: React.CSSProperties = {
        width: `${settings.width}px`,
        minHeight: `${settings.height}px`,
        paddingTop: `${settings.margins.top}mm`,
        paddingBottom: `${settings.margins.bottom}mm`,
        paddingLeft: `${settings.margins.left}mm`,
        paddingRight: `${settings.margins.right}mm`,
        fontSize: `${settings.fontSize}pt`,
    };

    let questionCounter = 0;
    const allQuestionIds = allQuestions.filter(q => q.type !== 'section-header').map(q => q.id);

    return (
        <div ref={ref} className="bg-white text-black font-serif max-w-none mx-auto border rounded-sm shadow-lg paper-page" style={pageStyle}>
            {isFirstPage && (
                <>
                    <header className="text-center mb-6">
                        <h1 className="text-xl font-bold">{paper.schoolName}</h1>
                        <h2 className="text-lg">{paper.examTitle}</h2>
                    </header>

                    <div className="flex justify-between text-sm mb-4 pb-2 border-b-2 border-dotted">
                        <p>বিষয়: {getSubjectName(paper.subject)}</p>
                        <p>পূর্ণমান: {paper.totalMarks}</p>
                    </div>
                    <div className="flex justify-between text-sm mb-6 pb-2 border-b-2 border-dotted">
                        <p>শ্রেণি: {getGradeName(paper.grade)}</p>        
                        <p>সময়: {paper.timeAllowed}</p>
                    </div>
                </>
            )}

            <main className={!isFirstPage ? 'pt-8' : ''}>
                {pageContent.map(content => {
                    let questionNumber = 0;
                    if (content.mainQuestion.type !== 'section-header') {
                      const idx = allQuestionIds.indexOf(content.mainQuestion.id);
                      if (idx !== -1) {
                          questionNumber = idx + 1;
                      }
                    }

                    const questionToRender: Question = {
                        ...content.mainQuestion,
                        subQuestions: content.subQuestions
                    };
                    return renderQuestionContent(questionToRender, questionNumber, allQuestions, content.showMainContent);
                })}
            </main>
        </div>
    );
});
PaperPage.displayName = "PaperPage";

interface PaperSettings {
  margins: { top: number; bottom: number; left: number; right: number; };
  width: number;
  height: number;
  fontSize: number;
}

export default function PaperPreview({ paper }: { paper: Paper }) {
    const [pages, setPages] = React.useState<PageContent[][]>([]);
    const [currentPage, setCurrentPage] = React.useState(0);
    const hiddenRenderRef = React.useRef<HTMLDivElement>(null);
    const [settings, setSettings] = React.useState<PaperSettings>({ 
      margins: { top: 20, bottom: 20, left: 20, right: 20 },
      width: 870,
      height: 1122, // Approx A4 height in px at 96 DPI
      fontSize: 12,
    });

    const handleSettingChange = (key: keyof PaperSettings, value: any) => {
        setSettings(prev => ({...prev, [key]: value }));
    };

    const handleMarginChange = (side: keyof PaperSettings['margins'], value: string) => {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        setSettings(prev => ({...prev, margins: {...prev.margins, [side]: numValue }}));
      }
    }
    
    React.useEffect(() => {
        const calculatePages = () => {
            if (!hiddenRenderRef.current || paper.questions.length === 0) {
                setPages([]);
                return;
            }
    
            const pageBreakThreshold = settings.height - (settings.margins.top + settings.margins.bottom) * 3.78; // Convert mm to px
            const hiddenPage = hiddenRenderRef.current;
            const headerEl = hiddenPage.querySelector('.preview-header');
            const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0;
            
            const newPages: PageContent[][] = [];
            let currentPageContent: PageContent[] = [];
            let currentPageHeight = 0;
            let isFirstPage = true;
    
            const startNewPage = () => {
                if (currentPageContent.length > 0) {
                    newPages.push(currentPageContent);
                }
                currentPageContent = [];
                currentPageHeight = 0;
                isFirstPage = false;
            };
    
            paper.questions.forEach((question) => {
                const questionElement = hiddenPage.querySelector(`[data-question-id="${question.id}"]`);
                if (!questionElement) return;
    
                const mainContentEl = questionElement.querySelector('.question-content');
                const mainContentHeight = mainContentEl?.getBoundingClientRect().height || 0;
    
                let availableHeight = isFirstPage ? pageBreakThreshold - headerHeight : pageBreakThreshold;
    
                let mainOnPage = currentPageContent.find(p => p.mainQuestion.id === question.id);
    
                if (!mainOnPage) {
                    if (currentPageHeight + mainContentHeight > availableHeight && currentPageContent.length > 0) {
                        startNewPage();
                        availableHeight = pageBreakThreshold;
                    }
                    if (isFirstPage && currentPageHeight === 0) {
                        currentPageHeight += headerHeight;
                    }
                    
                    const contentToAdd: PageContent = { mainQuestion: {...question, subQuestions: []}, subQuestions: [], showMainContent: true };
                    currentPageContent.push(contentToAdd);
                    mainOnPage = contentToAdd;
                    currentPageHeight += mainContentHeight;
                }
    
                question.subQuestions?.forEach((sq) => {
                    const subQuestionEl = questionElement.querySelector(`[data-subquestion-id="${sq.id}"]`);
                    if (!subQuestionEl) return;
                    
                    const subQuestionHeight = subQuestionEl.getBoundingClientRect().height;
                    let currentAvailableHeight = isFirstPage ? pageBreakThreshold - headerHeight : pageBreakThreshold;
    
                    if (currentPageHeight + subQuestionHeight > currentAvailableHeight) {
                        startNewPage();
                        currentAvailableHeight = pageBreakThreshold;
    
                        let existingMainOnNewPage = currentPageContent.find(p => p.mainQuestion.id === question.id);
                        if (!existingMainOnNewPage) {
                            const newMainContent: PageContent = { mainQuestion: {...question, subQuestions: []}, subQuestions: [], showMainContent: false };
                            currentPageContent.push(newMainContent);
                            mainOnPage = newMainContent;
                        } else {
                            mainOnPage = existingMainOnNewPage;
                        }
                    }
    
                    mainOnPage!.subQuestions.push(sq);
                    currentPageHeight += subQuestionHeight;
                });
            });
    
            if (currentPageContent.length > 0) {
                newPages.push(currentPageContent);
            }
            
            setPages(newPages);
            if (currentPage >= newPages.length) {
                setCurrentPage(Math.max(0, newPages.length - 1));
            }
        };
    
        const timer = setTimeout(calculatePages, 200);
        return () => clearTimeout(timer);
    
    }, [paper, settings]);


  return (
    <>
        {/* Hidden container for layout calculation */}
        <div className="absolute top-0 left-[-9999px] opacity-0 pointer-events-none" style={{ width: `${settings.width}px` }}>
             <div ref={hiddenRenderRef}>
                <div style={{
                    paddingTop: `${settings.margins.top}mm`,
                    paddingBottom: `${settings.margins.bottom}mm`,
                    paddingLeft: `${settings.margins.left}mm`,
                    paddingRight: `${settings.margins.right}mm`,
                    fontSize: `${settings.fontSize}pt`,
                }}>
                  <header className="text-center mb-6 preview-header">
                      <h1 className="text-xl font-bold">{paper.schoolName}</h1>
                      <h2 className="text-lg">{paper.examTitle}</h2>
                      <div className="flex justify-between text-sm mt-4 mb-4 pb-2 border-b-2 border-dotted">
                          <p>বিষয়: {subjectMap[paper.subject] || paper.subject}</p>
                          <p>পূর্ণমান: {paper.totalMarks}</p>
                      </div>
                      <div className="flex justify-between text-sm mb-6 pb-2 border-b-2 border-dotted">
                          <p>শ্রেণি: {gradeMap[paper.grade] || paper.grade}</p>
                          <p>সময়: {paper.timeAllowed}</p>
                      </div>
                  </header>
                  <main>
                   {paper.questions.map((q, index) => {
                       const actualIndex = paper.questions.filter(qu => qu.type !== 'section-header').findIndex(qu => qu.id === q.id) + 1;
                       const rendered = renderQuestionContent(q, actualIndex, paper.questions, true);
                       return React.cloneElement(rendered, { key: q.id });
                   })}
                  </main>
                </div>
            </div>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4 mb-4 p-4 border-b bg-slate-50">
            <div className='flex items-center gap-2'>
              <Label htmlFor='paper-width'>Width (px)</Label>
              <Input id='paper-width' type="number" value={settings.width} onChange={(e) => handleSettingChange('width', Number(e.target.value))} className="w-24 h-8" />
            </div>
            <div className='flex items-center gap-2'>
              <Label htmlFor='paper-height'>Height (px)</Label>
              <Input id='paper-height' type="number" value={settings.height} onChange={(e) => handleSettingChange('height', Number(e.target.value))} className="w-24 h-8" />
            </div>
            <div className='flex items-center gap-2'>
              <Label htmlFor='font-size'>Font (pt)</Label>
              <Input id='font-size' type="number" value={settings.fontSize} onChange={(e) => handleSettingChange('fontSize', Number(e.target.value))} className="w-20 h-8" />
            </div>
            <div className='flex items-center gap-2'>
              <Label htmlFor='margin-top'>Top (mm)</Label>
              <Input id='margin-top' type="number" value={settings.margins.top} onChange={(e) => handleMarginChange('top', e.target.value)} className="w-20 h-8" />
            </div>
             <div className='flex items-center gap-2'>
              <Label htmlFor='margin-bottom'>Bottom (mm)</Label>
              <Input id='margin-bottom' type="number" value={settings.margins.bottom} onChange={(e) => handleMarginChange('bottom', e.target.value)} className="w-20 h-8" />
            </div>
             <div className='flex items-center gap-2'>
              <Label htmlFor='margin-left'>Left (mm)</Label>
              <Input id='margin-left' type="number" value={settings.margins.left} onChange={(e) => handleMarginChange('left', e.target.value)} className="w-20 h-8" />
            </div>
             <div className='flex items-center gap-2'>
              <Label htmlFor='margin-right'>Right (mm)</Label>
              <Input id='margin-right' type="number" value={settings.margins.right} onChange={(e) => handleMarginChange('right', e.target.value)} className="w-20 h-8" />
            </div>
        </div>

        {/* Visible container for rendering pages */}
        <div className="space-y-4">
            {pages.length > 0 ? (
                pages[currentPage] ? (
                    <PaperPage 
                        paper={paper} 
                        pageContent={pages[currentPage]} 
                        isFirstPage={currentPage === 0} 
                        settings={settings} 
                        allQuestions={paper.questions}
                    />
                ) : <p>Page {currentPage + 1} is empty or invalid.</p>
            ) : (
                <PaperPage paper={paper} pageContent={[]} isFirstPage={true} settings={settings} allQuestions={paper.questions} />
            )}
        </div>
        
        {pages.length > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4">
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}>
                    <ChevronLeft className="size-4" />
                </Button>
                <span>Page {currentPage + 1} of {pages.length}</span>
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(pages.length - 1, p + 1))} disabled={currentPage === pages.length - 1}>
                    <ChevronRight className="size-4" />
                </Button>
            </div>
        )}
    </>
  );
}
