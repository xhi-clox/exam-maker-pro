
'use client';

import React, { useRef, useEffect, useState } from 'react';
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

const renderQuestionContent = (question: Question, questionIndex: number) => {
    return (
      <div key={question.id} className="mb-4 question-item" data-question-id={question.id}>
        <div className="flex justify-between font-semibold question-content">
          <p className="flex-1">{questionIndex + 1}. {question.content}</p>
        </div>
  
        {question.subQuestions && question.subQuestions.length > 0 && (
          <div className="pl-6 mt-2 space-y-2">
            {question.subQuestions.map((sq, sqIndex) => (
              <div key={sq.id} className="subquestion-item" data-subquestion-id={sq.id}>
                <div className="flex justify-between">
                  <p>{getNumbering(question.numberingFormat, sqIndex)}) {sq.content}</p>
                </div>
                {sq.options && sq.options.length > 0 && (
                  <div className="pl-6 mt-2 grid grid-cols-2 gap-x-8 gap-y-2">
                    {sq.options.map((option, optIndex) => (
                      <p key={option.id}>{getNumbering('bangla-alpha', optIndex)}) {option.text}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
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
}

const PaperPage = React.forwardRef<HTMLDivElement, { paper: Paper; pageContent: PageContent[]; isFirstPage: boolean; margins: any; allQuestions: Question[] }>(({ paper, pageContent, isFirstPage, margins, allQuestions }, ref) => {
    const getSubjectName = (subjectKey: string) => subjectMap[subjectKey] || subjectKey;
    const getGradeName = (gradeKey: string) => gradeMap[gradeKey] || gradeKey;
    
    const pageStyle: React.CSSProperties = {
        width: '210mm',
        minHeight: '297mm',
        paddingTop: `${margins.top}mm`,
        paddingBottom: `${margins.bottom}mm`,
        paddingLeft: `${margins.left}mm`,
        paddingRight: `${margins.right}mm`,
    };

    return (
        <div ref={ref} className="bg-white text-black font-serif max-w-3xl mx-auto border rounded-sm shadow-lg paper-page" style={pageStyle}>
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
                    const originalQuestionIndex = allQuestions.findIndex(q => q.id === content.mainQuestion.id);
                    const questionToRender: Question = {
                        ...content.mainQuestion,
                        subQuestions: content.subQuestions
                    };
                    return renderQuestionContent(questionToRender, originalQuestionIndex);
                })}
            </main>
        </div>
    );
});
PaperPage.displayName = "PaperPage";


export default function PaperPreview({ paper }: { paper: Paper }) {
    const [pages, setPages] = useState<PageContent[][]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const hiddenRenderRef = useRef<HTMLDivElement>(null);
    const [margins, setMargins] = useState({ top: 20, bottom: 20, left: 20, right: 20 });

    const handleMarginChange = (side: keyof typeof margins, value: string) => {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        setMargins(prev => ({...prev, [side]: numValue }));
      }
    }
    
    useEffect(() => {
        const calculatePages = () => {
            if (!hiddenRenderRef.current || paper.questions.length === 0) {
                setPages([]);
                return;
            }

            const MM_TO_PX = 3.7795275591;
            const PAGE_HEIGHT_MM = 297;
            const pageContentHeightPx = (PAGE_HEIGHT_MM - margins.top - margins.bottom) * MM_TO_PX;

            const hiddenPage = hiddenRenderRef.current;
            const headerEl = hiddenPage.querySelector('.preview-header');
            const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0;
            
            const newPages: PageContent[][] = [];
            let currentPageContent: PageContent[] = [];
            let currentPageHeight = 0;
            let isFirstPage = true;

            paper.questions.forEach((question) => {
                const questionElement = hiddenPage.querySelector(`[data-question-id="${question.id}"]`);
                if (!questionElement) return;

                const mainContentEl = questionElement.querySelector('.question-content');
                const mainContentHeight = mainContentEl?.getBoundingClientRect().height || 0;

                const availableHeight = isFirstPage ? pageContentHeightPx - headerHeight : pageContentHeightPx;

                // Check if main question content itself is too large for a new page
                if (currentPageHeight + mainContentHeight > availableHeight && currentPageHeight > 0) {
                    newPages.push(currentPageContent);
                    currentPageContent = [];
                    currentPageHeight = 0;
                    isFirstPage = false;
                }
                
                currentPageHeight += mainContentHeight;
                let currentQuestionOnPage: PageContent = {
                    mainQuestion: { ...question, subQuestions: [] },
                    subQuestions: [],
                };
                currentPageContent.push(currentQuestionOnPage);
                
                question.subQuestions?.forEach((sq) => {
                    const subQuestionEl = questionElement.querySelector(`[data-subquestion-id="${sq.id}"]`);
                    if (!subQuestionEl) return;

                    const subQuestionHeight = subQuestionEl.getBoundingClientRect().height;
                    const recheckAvailableHeight = isFirstPage ? pageContentHeightPx - headerHeight : pageContentHeightPx;

                    if (currentPageHeight + subQuestionHeight > recheckAvailableHeight) {
                        newPages.push(currentPageContent);
                        currentPageContent = [];
                        currentPageHeight = 0;
                        isFirstPage = false;

                        // Check if this sub-question needs to start on a new page under the same main question
                        const existingMain = currentPageContent.find(pc => pc.mainQuestion.id === question.id);
                        if (!existingMain) {
                            currentQuestionOnPage = {
                                mainQuestion: { ...question, subQuestions: [] },
                                subQuestions: [],
                            };
                            currentPageContent.push(currentQuestionOnPage);
                            // Add main question content height if it's a new page for this main question
                            currentPageHeight += mainContentHeight;
                        }
                    }

                    currentPageHeight += subQuestionHeight;
                    const mainOnPage = currentPageContent.find(pc => pc.mainQuestion.id === question.id);
                    if (mainOnPage) {
                       mainOnPage.subQuestions.push(sq);
                    }
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

        const timer = setTimeout(calculatePages, 100);
        return () => clearTimeout(timer);

    }, [paper, margins]);

  return (
    <>
        {/* Hidden container for layout calculation */}
        <div className="absolute top-0 left-[-9999px] opacity-0 pointer-events-none" style={{ width: '210mm' }}>
             <div ref={hiddenRenderRef}>
                <div style={{
                    paddingTop: `${margins.top}mm`,
                    paddingBottom: `${margins.bottom}mm`,
                    paddingLeft: `${margins.left}mm`,
                    paddingRight: `${margins.right}mm`,
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
                       const rendered = renderQuestionContent(q, index);
                       return React.cloneElement(rendered, { key: q.id });
                   })}
                  </main>
                </div>
            </div>
        </div>

        <div className="flex justify-center items-center gap-4 mb-4 p-4 border-b bg-slate-50">
            <div className='flex items-center gap-2'>
              <Label htmlFor='margin-top'>Top (mm)</Label>
              <Input id='margin-top' type="number" value={margins.top} onChange={(e) => handleMarginChange('top', e.target.value)} className="w-20 h-8" />
            </div>
             <div className='flex items-center gap-2'>
              <Label htmlFor='margin-bottom'>Bottom (mm)</Label>
              <Input id='margin-bottom' type="number" value={margins.bottom} onChange={(e) => handleMarginChange('bottom', e.target.value)} className="w-20 h-8" />
            </div>
             <div className='flex items-center gap-2'>
              <Label htmlFor='margin-left'>Left (mm)</Label>
              <Input id='margin-left' type="number" value={margins.left} onChange={(e) => handleMarginChange('left', e.target.value)} className="w-20 h-8" />
            </div>
             <div className='flex items-center gap-2'>
              <Label htmlFor='margin-right'>Right (mm)</Label>
              <Input id='margin-right' type="number" value={margins.right} onChange={(e) => handleMarginChange('right', e.target.value)} className="w-20 h-8" />
            </div>
        </div>

        {/* Visible container for rendering pages */}
        <div className="space-y-4">
             {pages.length > 0 ? (
                <PaperPage paper={paper} pageContent={pages[currentPage]} isFirstPage={currentPage === 0} margins={margins} allQuestions={paper.questions} />
            ) : (
                <PaperPage paper={paper} pageContent={[]} isFirstPage={true} margins={margins} allQuestions={paper.questions} />
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

    