'use client';

import React from 'react';
import type { Paper, Question } from './page';

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

const renderQuestionPreview = (question: Question, index: number) => {
  return (
    <div key={question.id} className="mb-4">
      <div className="flex justify-between font-semibold">
        <p>{index + 1}. {question.content}</p>
        {question.subQuestions && question.subQuestions.length > 0 ? null : <p>{question.marks || ''}</p>}
      </div>
      {question.subQuestions && question.subQuestions.length > 0 && (
        <div className="pl-6 mt-2 space-y-2">
          {question.subQuestions.map((sq) => (
            <div key={sq.id} className="flex justify-between">
              <p>{sq.content}</p>
              <p>{sq.marks}</p>
            </div>
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
        <p>শ্রেণি: {getGradeName(paper.grade)}</p>
        <p>সময়: {paper.timeAllowed}</p>
      </div>

      <main>
        {paper.questions.map((q, index) => renderQuestionPreview(q, index))}
      </main>
    </div>
  );
}
