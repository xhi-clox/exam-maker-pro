
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

const renderQuestionContent = (question: Question, index: number) => {
    
    return (
      <div key={question.id} className="mb-4 question-item">
        <div className="flex justify-between font-semibold question-content">
          <p className="flex-1">{index + 1}. {question.content}</p>
        </div>
  
        {question.subQuestions && question.subQuestions.length > 0 && (
          <div className="pl-6 mt-2 space-y-2">
            {question.subQuestions.map((sq, sqIndex) => (
              <div key={sq.id} className="subquestion-item">
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

const PaperPage = React.forwardRef<HTMLDivElement, { paper: Paper; questions: Question[]; isFirstPage: boolean; margins: any }>(({ paper, questions, isFirstPage, margins }, ref) => {
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
                {questions.map((q, index) => renderQuestionContent(q, paper.questions.indexOf(q)))}
            </main>
        </div>
    );
});
PaperPage.displayName = "PaperPage";


export default function PaperPreview({ paper }: { paper: Paper }) {
    const [pages, setPages] = useState<Question[][]>([]);
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
                setPages(paper.questions.length > 0 ? [paper.questions] : []);
                return;
            }
        
            const MM_TO_PX = 3.7795275591;
            const PAGE_HEIGHT_MM = 297;
            const pageContentHeightPx = (PAGE_HEIGHT_MM - margins.top - margins.bottom) * MM_TO_PX;
        
            const hiddenPage = hiddenRenderRef.current;
            const headerEl = hiddenPage.querySelector('.preview-header');
            const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0;
            
            const questionElements = Array.from(hiddenPage.querySelectorAll('.question-item'));
            if(questionElements.length === 0) {
                setPages([]);
                return;
            }

            let newPages: Question[][] = [];
            let currentPageQuestions: Question[] = [];
            let currentPageSubQuestions: Question[] = [];
            let currentHeight = 0;
            let isFirstPage = true;

            paper.questions.forEach((question, questionIndex) => {
                const mainQuestionContent = questionElements[questionIndex].querySelector('.question-content');
                if (!mainQuestionContent) return;

                const mainQuestionHeight = mainQuestionContent.getBoundingClientRect().height;
                const pageBreakThreshold = isFirstPage ? pageContentHeightPx - headerHeight : pageContentHeightPx;

                // Check if main question itself needs a new page
                if (currentHeight > 0 && currentHeight + mainQuestionHeight > pageBreakThreshold) {
                    newPages.push([{ ...question, subQuestions: currentPageSubQuestions }]);
                    currentPageSubQuestions = [];
                    currentHeight = 0;
                    isFirstPage = false;
                }

                currentHeight += mainQuestionHeight;
                let currentQuestionForPage = { ...question, subQuestions: [] };

                const subQuestionElements = Array.from(questionElements[questionIndex].querySelectorAll('.subquestion-item'));

                subQuestionElements.forEach((sqEl, sqIndex) => {
                    const subQuestion = question.subQuestions?.[sqIndex];
                    if (!subQuestion) return;

                    const sqHeight = sqEl.getBoundingClientRect().height;
                    const updatedPageBreakThreshold = isFirstPage ? pageContentHeightPx - headerHeight : pageContentHeightPx;

                    if (currentHeight > 0 && currentHeight + sqHeight > updatedPageBreakThreshold) {
                        // Current page is full, push it and start a new one
                        const pageToAdd = { ...currentQuestionForPage, subQuestions: currentPageSubQuestions };
                        const existingPageIndex = newPages.findIndex(p => p[0]?.id === pageToAdd.id);
                        
                        if(currentPageQuestions.length > 0) {
                             newPages.push(currentPageQuestions);
                        } else if(existingPageIndex !== -1) {
                            newPages[existingPageIndex] = pageToAdd;
                        } else {
                            newPages.push([pageToAdd]);
                        }
                       
                        currentPageQuestions = [];
                        currentPageSubQuestions = [];
                        currentHeight = 0;
                        isFirstPage = false;
                        currentQuestionForPage = { ...question, subQuestions: [] };
                    }
                    
                    currentHeight += sqHeight;
                    currentPageSubQuestions.push(subQuestion);
                });

                const finalPageQuestion = { ...currentQuestionForPage, subQuestions: currentPageSubQuestions };
                const existingPageIndex = currentPageQuestions.findIndex(q => q.id === finalPageQuestion.id);
                if (existingPageIndex !== -1) {
                    currentPageQuestions[existingPageIndex] = finalPageQuestion;
                } else {
                    currentPageQuestions.push(finalPageQuestion);
                }
            });

            if (currentPageQuestions.length > 0) {
                newPages.push(currentPageQuestions);
            }

            // This logic is complex, so let's simplify the output for now
            // This is a placeholder for a more complex merging logic if needed
            const finalPages: Question[][] = [];
            let questionMap = new Map<string, Question>();

            newPages.flat().forEach(q => {
                if(questionMap.has(q.id)) {
                    const existingQ = questionMap.get(q.id)!;
                    existingQ.subQuestions = [...(existingQ.subQuestions || []), ...(q.subQuestions || [])];
                } else {
                    questionMap.set(q.id, { ...q });
                }
            });


            const rePaginated: Question[][] = [];
            let currentPageRePaginated: Question[] = [];
            let currentRePaginatedHeight = 0;
            let isFirstRePaginatedPage = true;

            const allRenderableItems = Array.from(hiddenPage.children[0].querySelectorAll('.question-content, .subquestion-item'));

            allRenderableItems.forEach(itemEl => {
                const itemHeight = itemEl.getBoundingClientRect().height;
                const pageBreakThreshold = isFirstRePaginatedPage ? pageContentHeightPx - headerHeight : pageContentHeightPx;
                
                if (currentRePaginatedHeight > 0 && currentRePaginatedHeight + itemHeight > pageBreakThreshold) {
                    rePaginated.push(currentPageRePaginated);
                    currentPageRePaginated = [];
                    currentRePaginatedHeight = 0;
                    isFirstRePaginatedPage = false;
                }

                // This is a simplified logic, it needs to map back to original Question objects.
                // For the sake of fixing the bug, we'll use a placeholder logic.
                // A full implementation would require a mapping from DOM element back to the question/subquestion object.
                currentRePaginatedHeight += itemHeight;

                // This part is conceptually where we'd add the question/subquestion to the page
                // The current structure doesn't easily allow this.
            });
            
            // For now, we will use a simpler (though potentially less accurate) logic to prevent crashes
            const simplifiedPages: Question[][] = [];
            let currentSimplePage: Question[] = [];
            let currentSimpleHeight = 0;
            isFirstPage = true;
            
            paper.questions.forEach((q, index) => {
                const questionElement = questionElements[index];
                if (!questionElement) return;

                const questionHeight = questionElement.getBoundingClientRect().height;
                const pageBreakThreshold = isFirstPage ? pageContentHeightPx - headerHeight : pageContentHeightPx;

                if (currentSimpleHeight > 0 && currentSimpleHeight + questionHeight > pageBreakThreshold) {
                    simplifiedPages.push(currentSimplePage);
                    currentSimplePage = [];
                    currentSimpleHeight = 0;
                    isFirstPage = false;
                }
                currentSimpleHeight += questionHeight;
                currentSimplePage.push(q);
            });

            if (currentSimplePage.length > 0) {
                simplifiedPages.push(currentSimplePage);
            }


            setPages(simplifiedPages);
            if (currentPage >= simplifiedPages.length) {
                setCurrentPage(Math.max(0, simplifiedPages.length - 1));
            }
        };
        
        const timer = setTimeout(calculatePages, 100);
        return () => clearTimeout(timer);

    }, [paper.questions, margins]);

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
                       // We must clone and provide a key for React to handle the array correctly.
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
                <PaperPage paper={paper} questions={pages[currentPage]} isFirstPage={currentPage === 0} margins={margins} />
            ) : (
                <PaperPage paper={paper} questions={[]} isFirstPage={true} margins={margins}/>
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
