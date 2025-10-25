'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Send } from 'lucide-react';

// Install these packages:
// npm install katex react-katex
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathExpressionsProps {
  onInsert: (expression: string) => void;
}

interface ExpressionItem {
  label: string;
  value: string;
  latex?: string; // LaTeX representation
}

interface ExpressionCategory {
  category: string;
  expressions: ExpressionItem[];
}

const expressionCategories: ExpressionCategory[] = [
  {
    category: "Basic Operations",
    expressions: [
      { label: "+", value: "+", latex: "+" },
      { label: "−", value: "-", latex: "-" },
      { label: "×", value: "\\times", latex: "\\times" },
      { label: "÷", value: "\\div", latex: "\\div" },
      { label: "=", value: "=", latex: "=" },
      { label: "≠", value: "\\neq", latex: "\\neq" },
      { label: "<", value: "<", latex: "<" },
      { label: ">", value: ">", latex: ">" },
      { label: "≤", value: "\\leq", latex: "\\leq" },
      { label: "≥", value: "\\geq", latex: "\\geq" },
      { label: "±", value: "\\pm", latex: "\\pm" },
      { label: "(", value: "(", latex: "(" },
      { label: ")", value: ")", latex: ")" },
      { label: "[", value: "[", latex: "[" },
      { label: "]", value: "]", latex: "]" },
    ]
  },
  {
    category: "Fractions",
    expressions: [
      { label: "Simple Fraction", value: "\\frac{a}{b}", latex: "\\frac{a}{b}" },
      { label: "½", value: "\\frac{1}{2}", latex: "\\frac{1}{2}" },
      { label: "⅓", value: "\\frac{1}{3}", latex: "\\frac{1}{3}" },
      { label: "¼", value: "\\frac{1}{4}", latex: "\\frac{1}{4}" },
      { label: "⅔", value: "\\frac{2}{3}", latex: "\\frac{2}{3}" },
      { label: "¾", value: "\\frac{3}{4}", latex: "\\frac{3}{4}" },
      { label: "Mixed Fraction", value: "\\frac{a+b}{c}", latex: "\\frac{a+b}{c}" },
    ]
  },
  {
    category: "Algebra & Variables",
    expressions: [
      { label: "x", value: "x", latex: "x" },
      { label: "y", value: "y", latex: "y" },
      { label: "z", value: "z", latex: "z" },
      { label: "a", value: "a", latex: "a" },
      { label: "b", value: "b", latex: "b" },
      { label: "c", value: "c", latex: "c" },
      { label: "f(x)", value: "f(x)", latex: "f(x)" },
    ]
  },
  {
    category: "Powers & Exponents",
    expressions: [
      { label: "x²", value: "x^2", latex: "x^2" },
      { label: "x³", value: "x^3", latex: "x^3" },
      { label: "xⁿ", value: "x^n", latex: "x^n" },
      { label: "Square Root", value: "\\sqrt{x}", latex: "\\sqrt{x}" },
      { label: "Cube Root", value: "\\sqrt[3]{x}", latex: "\\sqrt[3]{x}" },
      { label: "n-th Root", value: "\\sqrt[n]{x}", latex: "\\sqrt[n]{x}" },
    ]
  },
  {
    category: "Subscripts & Superscripts",
    expressions: [
      { label: "x₁", value: "x_1", latex: "x_1" },
      { label: "x₂", value: "x_2", latex: "x_2" },
      { label: "xₙ", value: "x_n", latex: "x_n" },
      { label: "x¹", value: "x^1", latex: "x^1" },
      { label: "x²", value: "x^2", latex: "x^2" },
      { label: "x³", value: "x^3", latex: "x^3" },
    ]
  },
  {
    category: "Greek Letters",
    expressions: [
      { label: "α", value: "\\alpha", latex: "\\alpha" },
      { label: "β", value: "\\beta", latex: "\\beta" },
      { label: "γ", value: "\\gamma", latex: "\\gamma" },
      { label: "δ", value: "\\delta", latex: "\\delta" },
      { label: "θ", value: "\\theta", latex: "\\theta" },
      { label: "π", value: "\\pi", latex: "\\pi" },
      { label: "σ", value: "\\sigma", latex: "\\sigma" },
      { label: "ω", value: "\\omega", latex: "\\omega" },
      { label: "Δ", value: "\\Delta", latex: "\\Delta" },
      { label: "Σ", value: "\\Sigma", latex: "\\Sigma" },
      { label: "Ω", value: "\\Omega", latex: "\\Omega" },
    ]
  },
  {
    category: "Calculus",
    expressions: [
      { label: "∫", value: "\\int", latex: "\\int" },
      { label: "d/dx", value: "\\frac{d}{dx}", latex: "\\frac{d}{dx}" },
      { label: "∂", value: "\\partial", latex: "\\partial" },
      { label: "∞", value: "\\infty", latex: "\\infty" },
      { label: "lim", value: "\\lim", latex: "\\lim" },
      { label: "→", value: "\\to", latex: "\\to" },
      { label: "∑", value: "\\sum", latex: "\\sum" },
      { label: "∏", value: "\\prod", latex: "\\prod" },
    ]
  },
  {
    category: "Geometry",
    expressions: [
      { label: "∠", value: "\\angle", latex: "\\angle" },
      { label: "°", value: "^{\\circ}", latex: "^{\\circ}" },
      { label: "⊥", value: "\\perp", latex: "\\perp" },
      { label: "∥", value: "\\parallel", latex: "\\parallel" },
      { label: "△", value: "\\triangle", latex: "\\triangle" },
      { label: "≅", value: "\\cong", latex: "\\cong" },
      { label: "∼", value: "\\sim", latex: "\\sim" },
    ]
  },
  {
    category: "Set Theory & Logic",
    expressions: [
      { label: "∈", value: "\\in", latex: "\\in" },
      { label: "∉", value: "\\notin", latex: "\\notin" },
      { label: "⊂", value: "\\subset", latex: "\\subset" },
      { label: "⊆", value: "\\subseteq", latex: "\\subseteq" },
      { label: "∪", value: "\\cup", latex: "\\cup" },
      { label: "∩", value: "\\cap", latex: "\\cap" },
      { label: "∅", value: "\\emptyset", latex: "\\emptyset" },
      { label: "ℕ", value: "\\mathbb{N}", latex: "\\mathbb{N}" },
      { label: "ℤ", value: "\\mathbb{Z}", latex: "\\mathbb{Z}" },
      { label: "ℚ", value: "\\mathbb{Q}", latex: "\\mathbb{Q}" },
      { label: "ℝ", value: "\\mathbb{R}", latex: "\\mathbb{R}" },
      { label: "ℂ", value: "\\mathbb{C}", latex: "\\mathbb{C}" },
      { label: "∧", value: "\\wedge", latex: "\\wedge" },
      { label: "∨", value: "\\vee", latex: "\\vee" },
      { label: "¬", value: "\\neg", latex: "\\neg" },
      { label: "⇒", value: "\\Rightarrow", latex: "\\Rightarrow" },
      { label: "⇔", value: "\\Leftrightarrow", latex: "\\Leftrightarrow" },
      { label: "∀", value: "\\forall", latex: "\\forall" },
      { label: "∃", value: "\\exists", latex: "\\exists" },
    ]
  },
  {
    category: "Trigonometry",
    expressions: [
      { label: "sin", value: "\\sin", latex: "\\sin" },
      { label: "cos", value: "\\cos", latex: "\\cos" },
      { label: "tan", value: "\\tan", latex: "\\tan" },
      { label: "cot", value: "\\cot", latex: "\\cot" },
      { label: "sec", value: "\\sec", latex: "\\sec" },
      { label: "csc", value: "\\csc", latex: "\\csc" },
      { label: "sin⁻¹", value: "\\sin^{-1}", latex: "\\sin^{-1}" },
      { label: "cos⁻¹", value: "\\cos^{-1}", latex: "\\cos^{-1}" },
      { label: "tan⁻¹", value: "\\tan^{-1}", latex: "\\tan^{-1}" },
    ]
  },
];

export default function MathExpressions({ onInsert }: MathExpressionsProps) {
  const [currentExpression, setCurrentExpression] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Basic Operations', 'Fractions', 'Algebra & Variables'])
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

  const handleSymbolClick = (symbol: string) => {
    setCurrentExpression(prev => prev + symbol);
  };

  const handleSendExpression = () => {
    if (currentExpression.trim()) {
      // Send both LaTeX and plain text representation
      onInsert(`$${currentExpression}$`);
      setCurrentExpression('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendExpression();
    }
  };

  const handleClear = () => {
    setCurrentExpression('');
  };

  // Helper to render LaTeX preview
  const renderLatexPreview = (latex: string) => {
    try {
      return <InlineMath math={latex} />;
    } catch (error) {
      return <span className="text-red-500">Invalid LaTeX</span>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Build Mathematical Expression</CardTitle>
        <p className="text-sm text-muted-foreground">
          Build expressions using LaTeX • Real-time preview
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Expression Builder Section */}
        <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
          <div className="flex gap-2">
            <Input
              value={currentExpression}
              onChange={(e) => setCurrentExpression(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Build your LaTeX expression here... (e.g., \frac{1}{2} + \sqrt{x})"
              className="flex-1 font-mono text-sm"
            />
            <Button 
              onClick={handleSendExpression}
              disabled={!currentExpression.trim()}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClear}
              disabled={!currentExpression}
            >
              Clear
            </Button>
          </div>
          
          {/* Real-time Preview */}
          {currentExpression && (
            <div className="p-3 bg-white border rounded-md">
              <div className="text-xs text-muted-foreground mb-2">Preview:</div>
              <div className="min-h-[40px] flex items-center justify-center p-2 bg-gray-50 rounded">
                {renderLatexPreview(currentExpression)}
              </div>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            <p>LaTeX code: <code className="bg-background px-2 py-1 rounded border">{currentExpression || "(empty)"}</code></p>
          </div>
        </div>

        {/* Symbol Categories */}
        <div className="text-sm font-medium text-muted-foreground">
          Mathematical Symbols & Components (LaTeX)
        </div>

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
                        className="h-auto py-2 px-2 justify-center items-center min-h-[3rem] flex flex-col"
                        onClick={() => handleSymbolClick(expr.value)}
                        title={expr.label}
                      >
                        <div className="text-xs text-muted-foreground mb-1">
                          {expr.label}
                        </div>
                        <div className="text-sm">
                          {renderLatexPreview(expr.latex || expr.value)}
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-muted-foreground">
          <p className="font-semibold mb-1">💡 How LaTeX Works:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Click symbols to add LaTeX code to the builder</li>
            <li>See real-time preview of how it will look</li>
            <li>Send to insert formatted math into your question</li>
            <li>Examples: <code>\\frac{1}{2}</code>, <code>x^2</code>, <code>\\sqrt{x}</code></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
