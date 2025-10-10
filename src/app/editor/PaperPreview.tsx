
'use client';

import React from 'react';
import type { Paper, Question, NumberingFormat } from './page';

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

const renderQuestionPreview = (question: Question, index: number) => {
    
    if (question.type === 'table') {
        return (
            <div key={question.id} className="mb-4">
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

    if (question.type === 'fraction') {
        return (
            <div key={question.id} className="mb-4">
                <div className="flex items-center gap-4">
                    <p className="font-semibold">{index + 1}. {question.content}</p>
                    <div className="inline-flex flex-col items-center text-lg">
                        <span className="border-b border-black px-2">{question.numerator}</span>
                        <span>{question.denominator}</span>
                    </div>
                    <p className="font-semibold ml-auto">{question.marks || ''}</p>
                </div>
            </div>
        )
    }
  
    return (
      <div key={question.id} className="mb-4">
        <div className="flex justify-between font-semibold">
          <p>{index + 1}. {question.content}</p>
          <p>{question.marks || ''}</p>
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

export default function PaperPreview({ paper }: { paper: Paper }) {
  const getSubjectName = (subjectKey: string) => subjectMap[subjectKey] || subjectKey;
  const getGradeName = (gradeKey: string) => gradeMap[gradeKey] || gradeKey;
    
  return (
    <div className="p-8 bg-white text-black font-serif max-w-3xl mx-auto border rounded-sm shadow-lg">
      <header className="text-center mb-6">
        <h1 className="text-xl font-bold">{paper.schoolName}</h1>
        <h2 className="text-lg">{paper.examTitle}</h2>
      </header>

      <div className="flex justify-between text-sm mb-4 pb-2 border-b-2 border-dotted">
        <p>বিষয়: {getSubjectName(paper.subject)}</p>
        <p>পূর্ণমান: {paper.totalMarks}</p>
      </div>
      <div className="flex justify-between text-sm mb-6 pb-2 border-b-2 border-dotted">
        <p>শ্রেণি: {getGradeName(paper.grade)}</p>        <p>সময়: {paper.timeAllowed}</p>
      </div>

      <main>
        {paper.questions.map((q, index) => renderQuestionPreview(q, index))}
      </main>
    </div>
  );
}

