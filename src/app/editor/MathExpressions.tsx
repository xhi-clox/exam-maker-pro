
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MathExpressionsProps {
  onInsert: (expression: string) => void;
}

const expressions = [
  // Common Symbols
  'α', 'β', 'γ', 'δ', 'ε', 'θ', 'π', 'μ', 'σ', 'ω', 'Δ', 'Ω',
  '≈', '≠', '≤', '≥', '±', '∞', '∝', '∀', '∃',

  // Exponents & Subscripts
  'x²', 'x³', 'xⁿ', 'x⁻¹', 'aₓ', 'aₙ',

  // Fractions
  '½', '⅓', '¼', '¾', '⅐', '⅑', '⅒', '⁄',

  // Roots
  '√', '∛', '∜',

  // Set Theory
  '{}', '∈', '∉', '⊂', '⊃', '⊆', '⊇', '∪', '∩', '∅', 'A\'', 'P(A)', '|A|',

  // Logic & Operators
  '∴', '∵', '⇒', '⇔', '¬',

  // Geometry
  '∠', '⊥', '∥', '△', '°', '≅', '∼',

  // Calculus
  '∫', '∂', 'd/dx', 'lim', '→',

  // Algebra & Matrices
  'ƒ(x)', 'g(x)', '(ƒ ∘ g)(x)', 'x̄',
  'Σ', 'Π', 'n!',
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
  'log', 'ln', 'logₐ(b)', 'eˣ',

  // Vectors
  '→', '⇀',
];

export default function MathExpressions({ onInsert }: MathExpressionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mathematical Expressions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {expressions.map((expr) => (
            <Button
              key={expr}
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
