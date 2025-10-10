
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MathExpressionsProps {
  onInsert: (expression: string) => void;
}

const expressions = [
  // Common Symbols
  'α', 'β', 'γ', 'δ', 'ε', 'θ', 'π', 'μ', 'σ', 'ω', 'Δ', 'Ω',
  '≈', '≠', '≤', '≥', '±', '∞',
  // Exponents
  'x²', 'x³', 'xⁿ',
  // Fractions
  '½', '⅓', '¼', '⅕', '⅙', '⅛',
  // Roots
  '√', '∛', '∜',
  // Set Theory
  'A = { }', 'B = { }', 'R = {(x,y) | }', '∈', '∉', '⊂', '⊃', '⊆', '⊇', '∪', '∩', "P(A)",
  // Logic & Operators
  '∴', '∵',
  // Geometry
  '∠', '⊥', '∥', '△', '°',
  // Calculus
  '∫', '∂', 'ƒ(x)',
  // Logarithms from image
  'log₃(∛7 √7)', '(3y)ʸ⁺¹ / (yʸ)ʸ⁻¹ × 1/y²', 'log√y + logx³ - log√x³z³ + log(1.2) = 3/2',
  // Series from image
  '3 + 6 + 9 + 12 + ...',
  // Geometry from image
  'MN ∥ BC', 'MN = ½BC', '∠BPC = 90° + ½∠A',
];

export default function MathExpressions({ onInsert }: MathExpressionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mathematical Expressions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {expressions.map((expr) => (
            <Button
              key={expr}
              variant="outline"
              size="sm"
              className="font-mono"
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
