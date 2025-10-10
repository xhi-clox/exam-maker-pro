
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MathExpressionsProps {
  onInsert: (expression: string) => void;
}

const expressions = [
  // Basic Operators
  '+', '-', '×', '÷', '=', '≠', '<', '>', '≤', '≥', '±',

  // Common Symbols
  'α', 'β', 'γ', 'δ', 'ε', 'θ', 'π', 'μ', 'σ', 'ω', 'Δ', 'Ω', '∞', '≈',
  '∝', '∀', '∃', '∴', '∵', '¬',

  // Exponents & Subscripts
  'x²', 'x³', 'xⁿ', 'x⁻¹', 'aₓ', 'aₙ', 'eˣ',

  // Fractions & Roots
  '½', '⅓', '¼', '¾', '⁄', '√', '∛', '∜',

  // Set Theory
  '{}', '∈', '∉', '⊂', '⊃', '⊆', '⊇', '∪', '∩', '∅', "A'", 'P(A)', '|A|',

  // Geometry
  '∠', '⊥', '∥', '△', '°', '≅', '∼',

  // Calculus
  '∫', '∂', 'd/dx', 'lim', '→', 'ƒ(x)',

  // Algebra & Matrices
  'g(x)', '(ƒ ∘ g)(x)', 'x̄', 'Σ', 'Π', 'n!',
  
  // Trigonometry
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
  'sin⁻¹', 'cos⁻¹', 'tan⁻¹',

  // Logarithms
  'log', 'ln', 'logₐ(b)',

  // Vectors
  '⇀', '⋅', '×',
];

export default function MathExpressions({ onInsert }: MathExpressionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mathematical Expressions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {expressions.map((expr, index) => (
            <Button
              key={`${expr}-${index}`}
              variant="outline"
              size="sm"
              className="font-mono text-base"
              onClick={() => onInsert(expr)}
            >
              {expr}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

    