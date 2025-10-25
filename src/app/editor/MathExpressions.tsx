
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MathExpressionsProps {
  onInsert: (expression: string) => void;
}

interface ExpressionItem {
  label: string;
  value: string;
  visual?: string; // HTML representation for display
}

interface ExpressionCategory {
  category: string;
  expressions: ExpressionItem[];
}

// Helper function to create fraction HTML
const createFractionHTML = (numerator: string, denominator: string): string => {
  return `<span style="display: inline-block; text-align: center; vertical-align: middle; font-size: 1em;">
    <span style="display: block; padding: 0 0.3em;">${numerator}</span>
    <span style="display: block; border-top: 1.5px solid currentColor; padding: 0.1em 0.3em 0 0.3em;">${denominator}</span>
  </span>`;
};

const expressionCategories: ExpressionCategory[] = [
  {
    category: "Common from Images",
    expressions: [
      { 
        label: "Midpoint", 
        value: "M = ((x₁+x₂)/2, (y₁+y₂)/2)",
        visual: `M = (${createFractionHTML('x<sub>1</sub>+x<sub>2</sub>', '2')}, ${createFractionHTML('y<sub>1</sub>+y<sub>2</sub>', '2')})`
      },
      { 
        label: "f(x) fraction", 
        value: "f(x) = (3x-4)/(5x-8)",
        visual: `f(x) = ${createFractionHTML('3x−4', '5x−8')}`
      },
      { 
        label: "y² + 1/y²", 
        value: "y² + 1/y²",
        visual: `y<sup>2</sup> + ${createFractionHTML('1', 'y<sup>2</sup>')}`
      },
      { 
        label: "x³ + 1/x³", 
        value: "x³ + 1/x³",
        visual: `x<sup>3</sup> + ${createFractionHTML('1', 'x<sup>3</sup>')}`
      },
      { 
        label: "Quadratic Formula", 
        value: "x = (-b ± √(b²-4ac))/2a",
        visual: `x = ${createFractionHTML('−b ± √<span style="text-decoration: overline;">b<sup>2</sup>−4ac</span>', '2a')}`
      },
      { 
        label: "Slope", 
        value: "m = (y₂-y₁)/(x₂-x₁)",
        visual: `m = ${createFractionHTML('y<sub>2</sub>−y<sub>1</sub>', 'x<sub>2</sub>−x<sub>1</sub>')}`
      },
      { 
        label: "f(1/2) - 1", 
        value: "f(1/2) - 1",
        visual: `f(${createFractionHTML('1', '2')}) − 1`
      },
      { 
        label: "Sphere Volume", 
        value: "V = (4/3)πr³",
        visual: `V = ${createFractionHTML('4', '3')}πr<sup>3</sup>`
      },
      { 
        label: "1/32 + 1/256", 
        value: "1/32 + 1/256 + ⋯",
        visual: `${createFractionHTML('1', '32')} + ${createFractionHTML('1', '256')} + ⋯`
      },
    ]
  },
  {
    category: "Basic Fractions",
    expressions: [
      { 
        label: "a/b", 
        value: "a/b",
        visual: createFractionHTML('a', 'b')
      },
      { 
        label: "1/2", 
        value: "1/2",
        visual: createFractionHTML('1', '2')
      },
      { 
        label: "1/3", 
        value: "1/3",
        visual: createFractionHTML('1', '3')
      },
      { 
        label: "1/4", 
        value: "1/4",
        visual: createFractionHTML('1', '4')
      },
      { 
        label: "3/4", 
        value: "3/4",
        visual: createFractionHTML('3', '4')
      },
      { 
        label: "a+b/c", 
        value: "(a+b)/c",
        visual: createFractionHTML('a+b', 'c')
      },
      { 
        label: "a/b-c", 
        value: "a/(b-c)",
        visual: createFractionHTML('a', 'b−c')
      },
      { 
        label: "(ax+b)/(cx+d)", 
        value: "(ax+b)/(cx+d)",
        visual: createFractionHTML('ax+b', 'cx+d')
      },
      { 
        label: "x²+1/x-1", 
        value: "(x²+1)/(x-1)",
        visual: createFractionHTML('x<sup>2</sup>+1', 'x−1')
      },
    ]
  },
  {
    category: "Fractions with Powers",
    expressions: [
      { 
        label: "x²/y", 
        value: "x²/y",
        visual: createFractionHTML('x<sup>2</sup>', 'y')
      },
      { 
        label: "a/b²", 
        value: "a/b²",
        visual: createFractionHTML('a', 'b<sup>2</sup>')
      },
      { 
        label: "x²/y³", 
        value: "x²/y³",
        visual: createFractionHTML('x<sup>2</sup>', 'y<sup>3</sup>')
      },
      { 
        label: "1/x²", 
        value: "1/x²",
        visual: createFractionHTML('1', 'x<sup>2</sup>')
      },
      { 
        label: "1/x³", 
        value: "1/x³",
        visual: createFractionHTML('1', 'x<sup>3</sup>')
      },
      { 
        label: "(a/b)²", 
        value: "(a/b)²",
        visual: `(${createFractionHTML('a', 'b')})<sup>2</sup>`
      },
      { 
        label: "(a/b)ⁿ", 
        value: "(a/b)ⁿ",
        visual: `(${createFractionHTML('a', 'b')})<sup>n</sup>`
      },
    ]
  },
  {
    category: "Fractions with Roots",
    expressions: [
      { 
        label: "√x/y", 
        value: "√x/y",
        visual: createFractionHTML('√<span style="text-decoration: overline;">x</span>', 'y')
      },
      { 
        label: "a/√b", 
        value: "a/√b",
        visual: createFractionHTML('a', '√<span style="text-decoration: overline;">b</span>')
      },
      { 
        label: "√a/√b", 
        value: "√a/√b",
        visual: createFractionHTML('√<span style="text-decoration: overline;">a</span>', '√<span style="text-decoration: overline;">b</span>')
      },
      { 
        label: "1/√2", 
        value: "1/√2",
        visual: createFractionHTML('1', '√<span style="text-decoration: overline;">2</span>')
      },
      { 
        label: "(a+√b)/c", 
        value: "(a+√b)/c",
        visual: createFractionHTML('a+√<span style="text-decoration: overline;">b</span>', 'c')
      },
    ]
  },
  {
    category: "Complex Fractions",
    expressions: [
      { 
        label: "(a/b)/c", 
        value: "(a/b)/c",
        visual: createFractionHTML(createFractionHTML('a', 'b'), 'c')
      },
      { 
        label: "a/(b/c)", 
        value: "a/(b/c)",
        visual: createFractionHTML('a', createFractionHTML('b', 'c'))
      },
      { 
        label: "(a/b)/(c/d)", 
        value: "(a/b)/(c/d)",
        visual: createFractionHTML(createFractionHTML('a', 'b'), createFractionHTML('c', 'd'))
      },
      { 
        label: "a/b + c/d", 
        value: "a/b + c/d",
        visual: `${createFractionHTML('a', 'b')} + ${createFractionHTML('c', 'd')}`
      },
      { 
        label: "a/b × c/d", 
        value: "a/b × c/d",
        visual: `${createFractionHTML('a', 'b')} × ${createFractionHTML('c', 'd')}`
      },
    ]
  },
  {
    category: "Calculus & Derivatives",
    expressions: [
      { 
        label: "dy/dx", 
        value: "dy/dx",
        visual: createFractionHTML('dy', 'dx')
      },
      { 
        label: "d²y/dx²", 
        value: "d²y/dx²",
        visual: createFractionHTML('d<sup>2</sup>y', 'dx<sup>2</sup>')
      },
      { 
        label: "∂f/∂x", 
        value: "∂f/∂x",
        visual: createFractionHTML('∂f', '∂x')
      },
      { 
        label: "Δy/Δx", 
        value: "Δy/Δx",
        visual: createFractionHTML('Δy', 'Δx')
      },
      { 
        label: "∫ f(x)dx", 
        value: "∫f(x)dx",
        visual: "∫ f(x) dx"
      },
      { 
        label: "lim x→a", 
        value: "lim(x→a)",
        visual: "lim<sub>x→a</sub>"
      },
    ]
  },
  {
    category: "Basic Operators",
    expressions: [
      { label: "+", value: "+", visual: "+" },
      { label: "−", value: "−", visual: "−" },
      { label: "×", value: "×", visual: "×" },
      { label: "÷", value: "÷", visual: "÷" },
      { label: "=", value: "=", visual: "=" },
      { label: "≠", value: "≠", visual: "≠" },
      { label: "<", value: "<", visual: "&lt;" },
      { label: ">", value: ">", visual: "&gt;" },
      { label: "≤", value: "≤", visual: "≤" },
      { label: "≥", value: "≥", visual: "≥" },
      { label: "±", value: "±", visual: "±" },
      { label: "∓", value: "∓", visual: "∓" },
    ]
  },
  {
    category: "Powers & Exponents",
    expressions: [
      { label: "x²", value: "x²", visual: "x<sup>2</sup>" },
      { label: "x³", value: "x³", visual: "x<sup>3</sup>" },
      { label: "xⁿ", value: "xⁿ", visual: "x<sup>n</sup>" },
      { label: "x⁻¹", value: "x⁻¹", visual: "x<sup>−1</sup>" },
      { label: "x⁻²", value: "x⁻²", visual: "x<sup>−2</sup>" },
      { label: "eˣ", value: "eˣ", visual: "e<sup>x</sup>" },
      { label: "(a+b)²", value: "(a+b)²", visual: "(a+b)<sup>2</sup>" },
      { label: "(a+b)³", value: "(a+b)³", visual: "(a+b)<sup>3</sup>" },
      { label: "a²-b²", value: "a²-b²", visual: "a<sup>2</sup>−b<sup>2</sup>" },
    ]
  },
  {
    category: "Roots",
    expressions: [
      { label: "√x", value: "√x", visual: "√<span style='text-decoration: overline;'>x</span>" },
      { label: "∛x", value: "∛x", visual: "<sup style='font-size:0.7em;'>3</sup>√<span style='text-decoration: overline;'>x</span>" },
      { label: "∜x", value: "∜x", visual: "<sup style='font-size:0.7em;'>4</sup>√<span style='text-decoration: overline;'>x</span>" },
      { label: "ⁿ√x", value: "ⁿ√x", visual: "<sup style='font-size:0.7em;'>n</sup>√<span style='text-decoration: overline;'>x</span>" },
      { label: "√(a+b)", value: "√(a+b)", visual: "√<span style='text-decoration: overline;'>a+b</span>" },
      { label: "√(a²+b²)", value: "√(a²+b²)", visual: "√<span style='text-decoration: overline;'>a<sup>2</sup>+b<sup>2</sup></span>" },
    ]
  },
  {
    category: "Greek Letters",
    expressions: [
      { label: "α", value: "α", visual: "α" },
      { label: "β", value: "β", visual: "β" },
      { label: "γ", value: "γ", visual: "γ" },
      { label: "δ", value: "δ", visual: "δ" },
      { label: "ε", value: "ε", visual: "ε" },
      { label: "θ", value: "θ", visual: "θ" },
      { label: "λ", value: "λ", visual: "λ" },
      { label: "μ", value: "μ", visual: "μ" },
      { label: "π", value: "π", visual: "π" },
      { label: "σ", value: "σ", visual: "σ" },
      { label: "φ", value: "φ", visual: "φ" },
      { label: "ω", value: "ω", visual: "ω" },
      { label: "Δ", value: "Δ", visual: "Δ" },
      { label: "Σ", value: "Σ", visual: "Σ" },
      { label: "Π", value: "Π", visual: "Π" },
      { label: "Ω", value: "Ω", visual: "Ω" },
    ]
  },
  {
    category: "Subscripts",
    expressions: [
      { label: "x₁", value: "x₁", visual: "x<sub>1</sub>" },
      { label: "x₂", value: "x₂", visual: "x<sub>2</sub>" },
      { label: "xₙ", value: "xₙ", visual: "x<sub>n</sub>" },
      { label: "aᵢ", value: "aᵢ", visual: "a<sub>i</sub>" },
      { label: "y₂-y₁", value: "y₂-y₁", visual: "y<sub>2</sub>−y<sub>1</sub>" },
      { label: "x₂-x₁", value: "x₂-x₁", visual: "x<sub>2</sub>−x<sub>1</sub>" },
    ]
  },
  {
    category: "Functions",
    expressions: [
      { label: "f(x)", value: "f(x)", visual: "f(x)" },
      { label: "g(x)", value: "g(x)", visual: "g(x)" },
      { label: "f⁻¹(x)", value: "f⁻¹(x)", visual: "f<sup>−1</sup>(x)" },
      { label: "f(g(x))", value: "f(g(x))", visual: "f(g(x))" },
      { label: "|x|", value: "|x|", visual: "|x|" },
      { label: "⌊x⌋", value: "⌊x⌋", visual: "⌊x⌋" },
      { label: "⌈x⌉", value: "⌈x⌉", visual: "⌈x⌉" },
    ]
  },
  {
    category: "Trigonometry",
    expressions: [
      { label: "sin(x)", value: "sin(x)", visual: "sin(x)" },
      { label: "cos(x)", value: "cos(x)", visual: "cos(x)" },
      { label: "tan(x)", value: "tan(x)", visual: "tan(x)" },
      { label: "sin⁻¹(x)", value: "sin⁻¹(x)", visual: "sin<sup>−1</sup>(x)" },
      { label: "cos⁻¹(x)", value: "cos⁻¹(x)", visual: "cos<sup>−1</sup>(x)" },
      { label: "tan⁻¹(x)", value: "tan⁻¹(x)", visual: "tan<sup>−1</sup>(x)" },
      { label: "sin²(x)", value: "sin²(x)", visual: "sin<sup>2</sup>(x)" },
      { label: "cos²(x)", value: "cos²(x)", visual: "cos<sup>2</sup>(x)" },
    ]
  },
  {
    category: "Set Theory",
    expressions: [
      { label: "{}", value: "{}", visual: "{}" },
      { label: "{x:P(x)}", value: "{x:P(x)}", visual: "{x : P(x)}" },
      { label: "∈", value: "∈", visual: "∈" },
      { label: "∉", value: "∉", visual: "∉" },
      { label: "⊂", value: "⊂", visual: "⊂" },
      { label: "⊆", value: "⊆", visual: "⊆" },
      { label: "∪", value: "∪", visual: "∪" },
      { label: "∩", value: "∩", visual: "∩" },
      { label: "∅", value: "∅", visual: "∅" },
      { label: "ℕ", value: "ℕ", visual: "ℕ" },
      { label: "ℤ", value: "ℤ", visual: "ℤ" },
      { label: "ℚ", value: "ℚ", visual: "ℚ" },
      { label: "ℝ", value: "ℝ", visual: "ℝ" },
      { label: "ℂ", value: "ℂ", visual: "ℂ" },
    ]
  },
  {
    category: "Logic",
    expressions: [
      { label: "∧", value: "∧", visual: "∧" },
      { label: "∨", value: "∨", visual: "∨" },
      { label: "¬", value: "¬", visual: "¬" },
      { label: "⇒", value: "⇒", visual: "⇒" },
      { label: "⇔", value: "⇔", visual: "⇔" },
      { label: "∀", value: "∀", visual: "∀" },
      { label: "∃", value: "∃", visual: "∃" },
      { label: "∴", value: "∴", visual: "∴" },
      { label: "∵", value: "∵", visual: "∵" },
    ]
  },
  {
    category: "Sequences & Series",
    expressions: [
      { label: "Σ", value: "Σ", visual: "Σ" },
      { label: "Π", value: "Π", visual: "Π" },
      { label: "n!", value: "n!", visual: "n!" },
      { label: "ⁿCᵣ", value: "ⁿCᵣ", visual: "<sup>n</sup>C<sub>r</sub>" },
      { label: "⋯", value: "⋯", visual: "⋯" },
      { label: "...", value: "...", visual: "..." },
    ]
  },
  {
    category: "Geometry",
    expressions: [
      { label: "∠", value: "∠", visual: "∠" },
      { label: "°", value: "°", visual: "°" },
      { label: "⊥", value: "⊥", visual: "⊥" },
      { label: "∥", value: "∥", visual: "∥" },
      { label: "△", value: "△", visual: "△" },
      { label: "≅", value: "≅", visual: "≅" },
      { label: "∼", value: "∼", visual: "∼" },
      { label: "πr²", value: "πr²", visual: "πr<sup>2</sup>" },
    ]
  },
  {
    category: "Special Symbols",
    expressions: [
      { label: "∞", value: "∞", visual: "∞" },
      { label: "≈", value: "≈", visual: "≈" },
      { label: "≡", value: "≡", visual: "≡" },
      { label: "∝", value: "∝", visual: "∝" },
      { label: "≪", value: "≪", visual: "≪" },
      { label: "≫", value: "≫", visual: "≫" },
    ]
  },
];

export default function MathExpressions({ onInsert }: MathExpressionsProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Common from Images', 'Basic Fractions', 'Basic Operators'])
  );

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mathematical Expressions</CardTitle>
        <p className="text-sm text-muted-foreground">
          Click to insert • Visual fraction display
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {expressionCategories.map((category) => {
          const isExpanded = expandedCategories.has(category.category);
          
          return (
            <div key={category.category} className="border rounded-lg">
              <button
                onClick={() => toggleCategory(category.category)}
                className="w-full flex items-center justify-between p-3 hover:bg-accent rounded-lg transition-colors"
              >
                <span className="font-semibold text-sm">{category.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {category.expressions.length}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </button>
              
              {isExpanded && (
                <div className="p-3 pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {category.expressions.map((expr, index) => (
                      <Button
                        key={`${expr.value}-${index}`}
                        variant="outline"
                        size="sm"
                        className="h-auto py-3 px-3 justify-center items-center"
                        onClick={() => onInsert(expr.value)}
                        title={expr.label}
                      >
                        <span 
                          className="text-base leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: expr.visual || expr.value }}
                        />
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        <div className="mt-4 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
          <p className="font-semibold mb-1">💡 Fraction Display:</p>
          <p>Fractions appear with numerator on top and denominator below, just like in textbooks!</p>
        </div>
      </CardContent>
    </Card>
  );
}

    