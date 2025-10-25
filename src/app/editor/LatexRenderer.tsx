
'use client';

import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';

interface LatexRendererProps {
  content: string;
}

const LatexRenderer: React.FC<LatexRendererProps> = ({ content }) => {
  // Regex to find content between $...$ (inline) and $$...$$ (block)
  const inlineRegex = /\$([^$]+)\$/g;
  const blockRegex = /\$\$([^$]+)\$\$/g;

  const processString = (text: string) => {
    // First, handle block-level math so they are replaced first
    const partsByBlock = text.split(blockRegex);
    const elementsWithBlocks = partsByBlock.map((part, index) => {
      if (index % 2 === 1) { // This is a LaTeX block
        try {
          return <BlockMath key={`block-${index}`} math={part} />;
        } catch (e) {
          return <span key={`block-err-${index}`} className="text-red-500">Invalid Block LaTeX</span>;
        }
      } else {
        // This is a regular text part, process it for inline math
        const partsByInline = part.split(inlineRegex);
        return partsByInline.map((inlinePart, inlineIndex) => {
          if (inlineIndex % 2 === 1) { // This is an inline LaTeX part
            try {
              return <InlineMath key={`inline-${index}-${inlineIndex}`} math={inlinePart} />;
            } catch (e) {
              return <span key={`inline-err-${index}-${inlineIndex}`} className="text-red-500">Invalid Inline LaTeX</span>;
            }
          }
          return <span key={`text-${index}-${inlineIndex}`}>{inlinePart}</span>;
        });
      }
    });

    return <>{elementsWithBlocks}</>;
  };

  return <>{processString(content)}</>;
};

export default LatexRenderer;
