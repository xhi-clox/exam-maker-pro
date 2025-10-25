
'use client';

import React from 'react';

// This regex is designed to be simple and capture common cases without being overly complex.
// It looks for:
// 1. Simple fractions like a/b
// 2. Fractions with parentheses like (a+b)/(c-d)
// 3. Superscripts with ^ like x^2 or e^{x+1}
// 4. Subscripts with _ like x_1 or y_{ij}
const expressionRegex = /((?:\S*\(.*?\)\S*|\S)+)\/((?:\S*\(.*?\)\S*|\S)+)|(\S+)\^({[^}]+}|\S+)|(\S+)_({[^}]+}|\S+)/g;


// More advanced parser to handle nested fractions and other symbols
const advancedParser = (text: string): (string | React.ReactElement)[] => {
    const elements: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    let match;
  
    // This regex now specifically targets fractions, superscripts, and subscripts
    const regex = /(\([^)]+\)|[\w\d\.]+)\/(\([^)]+\)|[\w\d\.]+)|([\w\d]+)\^([\w\d\.\+\-]+|\{[^}]+\})|([\w\d]+)_([\w\d\.\+\-]+|\{[^}]+\})/g;

    // A simplified regex for basic fractions to avoid nesting issues
    const simpleFractionRegex = /([a-zA-Z0-9\.\(\)\+\-]+)\/([a-zA-Z0-9\.\(\)\+\-]+)/g;


    const createFraction = (num: string, den: string, key: string) => (
        <span key={key} className="math-fraction" contentEditable={false}>
            <span className="math-fraction-numerator">{num}</span>
            <span className="math-fraction-line"></span>
            <span className="math-fraction-denominator">{den}</span>
        </span>
    );

    const replaceFractions = (str: string, keyPrefix: string): (string | React.ReactElement)[] => {
        const parts: (string | React.ReactElement)[] = [];
        let lastIdx = 0;
        let result;
        while((result = simpleFractionRegex.exec(str)) !== null) {
            if(result.index > lastIdx) {
                parts.push(str.substring(lastIdx, result.index));
            }
            parts.push(createFraction(result[1], result[2], `${keyPrefix}-${result.index}`));
            lastIdx = result.index + result[0].length;
        }
        if(lastIdx < str.length) {
            parts.push(str.substring(lastIdx));
        }
        return parts;
    }
  
    while ((match = expressionRegex.exec(text)) !== null) {
      const [fullMatch, num, den, baseSup, sup, baseSub, sub] = match;
  
      // Add preceding text
      if (match.index > lastIndex) {
        elements.push(text.substring(lastIndex, match.index));
      }
  
      const key = `math-${match.index}`;
  
      if (num && den) {
        // It's a fraction
        elements.push(
          <span key={key} className="math-fraction">
            <span className="math-fraction-numerator">{num.replace(/[\(\)]/g, '')}</span>
            <span className="math-fraction-line" />
            <span className="math-fraction-denominator">{den.replace(/[\(\)]/g, '')}</span>
          </span>
        );
      } else if (baseSup && sup) {
        // It's a superscript
        elements.push(
          <span key={key}>
            {baseSup}
            <sup>{sup.replace(/[{}]/g, '')}</sup>
          </span>
        );
      } else if (baseSub && sub) {
        // It's a subscript
        elements.push(
          <span key={key}>
            {baseSub}
            <sub>{sub.replace(/[{}]/g, '')}</sub>
          </span>
        );
      }
  
      lastIndex = match.index + fullMatch.length;
    }
  
    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }
  
    return elements;
};
  

export const parseMath = (text: string) => {
    if (!text) return text;
    return (
        <>
            {advancedParser(text)}
        </>
    )
};
