
'use client';

import React, { useRef, useEffect, useState } from 'react';
import type { Paper, Question, NumberingFormat } from './page';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    
    if (question.type === 'table') {
        return (
            <div key={question.id} className="mb-4 question-item">
              <div className="flex justify-between font-semibold mb-2">
                <p>{index + 1}. {question.content}</p>
                <p>{question.marks || ''}</p>
              </div>
              <table className="w-full border-collapse border border-black text-sm">
                <tbody>
                  {question.tableData?.map((row, rIndex) => (
                    <tr key={rIndex}>
                      {row.map((cell, cIndex) => (
                        <td key={cIndex} className="border border-black p-1">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
    }
  
    return (
      <div key={question.id} className="mb-4 question-item">
        <div className="flex justify-between font-semibold">
          <p className="flex-1">{index + 1}. {question.content}</p>
          <p className="pl-4">{question.marks || ''}</p>
        </div>
  
        {question.subQuestions && question.subQuestions.length > 0 && (
          <div className="pl-6 mt-2 space-y-2">
            {question.subQuestions.map((sq, sqIndex) => (
              <div key={sq.id}>
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

const PaperPage = React.forwardRef<HTMLDivElement, { paper: Paper; questions: Question[]; isFirstPage: boolean }>(({ paper, questions, isFirstPage }, ref) => {
    const getSubjectName = (subjectKey: string) => subjectMap[subjectKey] || subjectKey;
    const getGradeName = (gradeKey: string) => gradeMap[gradeKey] || gradeKey;
    
    return (
        <div ref={ref} className="p-8 bg-white text-black font-serif max-w-3xl mx-auto border rounded-sm shadow-lg paper-page" style={{ width: '210mm', minHeight: '297mm'}}>
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

            <main className={isFirstPage ? '' : 'pt-16'}>
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
    
    useEffect(() => {
        const calculatePages = () => {
            if (!hiddenRenderRef.current) return;
    
            const PAGE_HEIGHT_PX = 1050; // Approximate height for A4 at 96 DPI, with margins
            
            const questionElements = Array.from(hiddenRenderRef.current.querySelectorAll('.question-item'));
            if (questionElements.length === 0) {
                setPages([[]]);
                return;
            }

            const headerHeight = (hiddenRenderRef.current.querySelector('header')?.clientHeight || 0) + 
                                 (hiddenRenderRef.current.querySelector('.flex.justify-between')?.clientHeight || 0) * 2 + 
                                 (hiddenRenderRef.current.querySelector('main')?.getBoundingClientRect().top || 0) - (hiddenRenderRef.current.getBoundingClientRect().top || 0);
            
            let newPages: Question[][] = [];
            let currentPageQuestions: Question[] = [];
            let currentHeight = headerHeight;
            let isFirstPage = true;

            questionElements.forEach((el, index) => {
                const questionHeight = (el as HTMLElement).offsetHeight + 16; // 16px for mb-4
                
                if (currentHeight + questionHeight > PAGE_HEIGHT_PX && currentPageQuestions.length > 0) {
                    newPages.push(currentPageQuestions);
                    currentPageQuestions = [];
                    currentHeight = 64; // Approx padding top for subsequent pages
                    isFirstPage = false;
                }
                
                currentHeight += questionHeight;
                const originalQuestionIndex = paper.questions.findIndex(q => q.id === (el as HTMLElement).dataset.questionId);
                if (originalQuestionIndex > -1) {
                  currentPageQuestions.push(paper.questions[originalQuestionIndex]);
                }
            });

            if (currentPageQuestions.length > 0) {
                newPages.push(currentPageQuestions);
            }
    
            setPages(newPages);
            if (currentPage >= newPages.length) {
                setCurrentPage(Math.max(0, newPages.length - 1));
            }
        };
        
        const timer = setTimeout(calculatePages, 200);

        return () => clearTimeout(timer);
    }, [paper, currentPage]);

  const renderHiddenQuestion = (question: Question, index: number) => {
    const rendered = renderQuestionContent(question, index);
    return React.cloneElement(rendered, { 'data-question-id': question.id });
  }

  return (
    <>
        {/* Hidden container for layout calculation */}
        <div className="absolute top-0 left-0 -z-10 opacity-0 pointer-events-none" style={{ width: '210mm' }}>
             <div ref={hiddenRenderRef}>
                <div className='p-8'>
                  <header className="text-center mb-6">
                      <h1 className="text-xl font-bold">{paper.schoolName}</h1>
                      <h2 className="text-lg">{paper.examTitle}</h2>
                  </header>
                  <div className="flex justify-between text-sm mb-4 pb-2 border-b-2 border-dotted">
                      <p>বিষয়: {subjectMap[paper.subject] || paper.subject}</p>
                      <p>পূর্ণমান: {paper.totalMarks}</p>
                  </div>
                  <div className="flex justify-between text-sm mb-6 pb-2 border-b-2 border-dotted">
                      <p>শ্রেণি: {gradeMap[paper.grade] || paper.grade}</p>
                      <p>সময়: {paper.timeAllowed}</p>
                  </div>
                  <main>
                   {paper.questions.map((q, index) => renderHiddenQuestion(q, index))}
                  </main>
                </div>
            </div>
        </div>

        {/* Visible container for rendering pages */}
        <div className="space-y-4">
             {pages.length > 0 ? (
                <PaperPage paper={paper} questions={pages[currentPage]} isFirstPage={currentPage === 0} />
            ) : (
                <PaperPage paper={paper} questions={[]} isFirstPage={true} />
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
