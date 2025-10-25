'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Send, AlertCircle, CheckCircle } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

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

// LaTeX Validator and Fixer
const validateAndFixLatex = (latex: string): { fixed: string; isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  let fixed = latex;
  
  // Common fixes for PDF conversion issues
  const fixes = [
    // Fix fraction syntax
    { 
      regex: /\\frac\{([^}]+)\}\{([^}]+)\}/g, 
      replacement: '\\frac{$1}{$2}',
      error: 'Malformed fraction'
    },
    // Fix missing braces in exponents
    {
      regex: /\\\^(\d)(?![^{])/g,
      replacement: '^{$1}',
      error: 'Missing braces in exponent'
    },
    // Fix nested fractions
    {
      regex: /\\frac\{([^}]*\\frac\{[^}]*\}[^}]*)\}\{([^}]*)\}/g,
      replacement: '\\frac{$1}{$2}',
      error: 'Nested fraction issue'
    },
    // Fix root expressions
    {
      regex: /\\sqrt\[(\d+)\]\{([^}]+)\}/g,
      replacement: '\\sqrt[$1]{$2}',
      error: 'Malformed root'
    },
    // Ensure proper grouping with parentheses
    {
      regex: /([a-zA-Z])(\d+)/g,
      replacement: '$1_{$2}',
      error: 'Missing subscript braces'
    }
  ];

  fixes.forEach(fix => {
    if (fix.regex.test(fixed)) {
      fixed = fixed.replace(fix.regex, fix.replacement);
      errors.push(`${fix.error}: Auto-fixed.`);
    }
  });

  // Basic syntax validation
  const openBraces = (fixed.match(/{/g) || []).length;
  const closeBraces = (fixed.match(/}/g) || []).length;
  
  if (openBraces !== closeBraces) {
    errors.push(`Mismatched braces: ${openBraces} opening vs ${closeBraces} closing`);
  }

  // Check for common problematic patterns from PDF conversion
  const pdfIssues = [
    { pattern: /\\text\{[^}]*\}(?![^{]*\})/, issue: 'Unclosed text command' },
    { pattern: /\\[a-zA-Z]+\{/, issue: 'Unclosed command' },
    { pattern: /\\frac[^{]/, issue: 'Malformed fraction command' }
  ];

  pdfIssues.forEach(({ pattern, issue }) => {
    if (pattern.test(fixed)) {
      errors.push(issue);
    }
  });

  return {
    fixed,
    isValid: errors.length === 0,
    errors
  };
};

const expressionCategories: ExpressionCategory[] = [
    {
      category: "Basic Operations",
      expressions: [
        { label: "+", value: " + ", latex: " + " },
        { label: "−", value: " - ", latex: " - " },
        { label: "×", value: " \\times ", latex: " \\times " },
        { label: "÷", value: " \\div ", latex: " \\div " },
        { label: "=", value: " = ", latex: " = " },
        { label: "(", value: "(", latex: "(" },
        { label: ")", value: ")", latex: ")" },
        { label: "[", value: "[", latex: "[" },
        { label: "]", value: "]", latex: "]" },
      ]
    },
    {
      category: "Fractions & Division",
      expressions: [
        { label: "Simple Fraction", value: "\\frac{}{}", latex: "\\frac{a}{b}" },
        { label: "x/y", value: "\\frac{x}{y}", latex: "\\frac{x}{y}" },
        { label: "(a+b)/(c+d)", value: "\\frac{a+b}{c+d}", latex: "\\frac{a+b}{c+d}" },
        { label: "Nested Fraction", value: "\\frac{\\frac{}{}}{}", latex: "\\frac{\\frac{a}{b}}{c}" },
        { label: "Complex Fraction", value: "\\frac{\\frac{}{}}{\\frac{}{}}", latex: "\\frac{\\frac{a}{b}}{\\frac{c}{d}}" },
      ]
    },
    {
      category: "Exponents & Powers",
      expressions: [
        { label: "x²", value: "x^{2}", latex: "x^{2}" },
        { label: "x³", value: "x^{3}", latex: "x^{3}" },
        { label: "xⁿ", value: "x^{n}", latex: "x^{n}" },
        { label: "x⁻¹", value: "x^{-1}", latex: "x^{-1}" },
        { label: "(x+y)²", value: "(x+y)^{2}", latex: "(x+y)^{2}" },
        { label: "Multiple Powers", value: "x^{2}y^{3}", latex: "x^{2}y^{3}" },
      ]
    },
    {
      category: "Roots & Radicals",
      expressions: [
        { label: "√x", value: "\\sqrt{x}", latex: "\\sqrt{x}" },
        { label: "∛x", value: "\\sqrt[3]{x}", latex: "\\sqrt[3]{x}" },
        { label: "∜x", value: "\\sqrt[4]{x}", latex: "\\sqrt[4]{x}" },
        { label: "ⁿ√x", value: "\\sqrt[n]{x}", latex: "\\sqrt[n]{x}" },
        { label: "√(x+y)", value: "\\sqrt{x+y}", latex: "\\sqrt{x+y}" },
      ]
    },
    {
      category: "Common Expressions",
      expressions: [
        { 
          label: "x² + x/y⁴", 
          value: "x^{2} + \\frac{x}{y^{4}}", 
          latex: "x^{2} + \\frac{x}{y^{4}}" 
        },
        { 
          label: "Quadratic Formula", 
          value: "x = \\frac{-b \\pm \\sqrt{b^{2}-4ac}}{2a}", 
          latex: "x = \\frac{-b \\pm \\sqrt{b^{2}-4ac}}{2a}" 
        },
        { 
          label: "Complex Fraction", 
          value: "\\frac{\\frac{a}{b} + \\frac{c}{d}}{e}", 
          latex: "\\frac{\\frac{a}{b} + \\frac{c}{d}}{e}" 
        },
      ]
    },
];

export default function MathExpressions({ onInsert }: MathExpressionsProps) {
  const [currentExpression, setCurrentExpression] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Basic Operations', 'Fractions & Division', 'Common Expressions'])
  );
  const [validation, setValidation] = useState<{ isValid: boolean; errors: string[]; fixed: string }>({
    isValid: true,
    errors: [],
    fixed: ''
  });

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
    const newExpression = currentExpression + symbol;
    setCurrentExpression(newExpression);
    validateExpression(newExpression);
  };

  const validateExpression = (expression: string) => {
    if (!expression.trim()) {
      setValidation({ isValid: true, errors: [], fixed: '' });
      return;
    }
    const result = validateAndFixLatex(expression);
    setValidation(result);
  };

  const handleExpressionChange = (expression: string) => {
    setCurrentExpression(expression);
    validateExpression(expression);
  };

  const handleSendExpression = () => {
    if (currentExpression.trim()) {
      // Use the fixed version if available and valid
      const expressionToSend = validation.isValid ? currentExpression : validation.fixed;
      onInsert(`$${expressionToSend}$`);
      setCurrentExpression('');
      setValidation({ isValid: true, errors: [], fixed: '' });
    }
  };
  
  const handleUseFixed = () => {
    if (validation.fixed) {
      setCurrentExpression(validation.fixed);
      validateExpression(validation.fixed);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendExpression();
    }
  };

  const handleClear = () => {
    setCurrentExpression('');
    setValidation({ isValid: true, errors: [], fixed: '' });
  };

  const renderLatexPreview = (latex: string) => {
    try {
      return <InlineMath math={latex} />;
    } catch (error) {
      return <span className="text-red-500">Invalid LaTeX</span>;
    }
  };

  return (
    <Card className="bg-slate-900 border-slate-700 text-white">
      <CardHeader>
        <CardTitle>Build Mathematical Expression</CardTitle>
        <p className="text-sm text-muted-foreground">
          Real-time LaTeX validation and fixing
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 p-4 border rounded-lg bg-slate-800 sticky top-0 z-10">
            <div>
                <Input
                  value={currentExpression}
                  onChange={(e) => handleExpressionChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter LaTeX code or use templates below..."
                  className="flex-1 font-mono text-sm bg-slate-700 border-slate-600"
                />
            </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleSendExpression}
              disabled={!currentExpression.trim() || !validation.isValid}
              className="flex items-center gap-2 flex-1"
            >
              <Send className="h-4 w-4" />
              Send
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClear}
              disabled={!currentExpression}
              className="flex-1 bg-slate-700 border-slate-600 hover:bg-slate-600"
            >
              Clear
            </Button>
          </div>
          
          {currentExpression && (
            <div className={`p-3 rounded-md ${
              validation.isValid ? 'bg-green-900/50 border border-green-700' : 'bg-yellow-900/50 border border-yellow-700'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {validation.isValid ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                )}
                <span className={`text-sm font-medium ${
                  validation.isValid ? 'text-green-300' : 'text-yellow-300'
                }`}>
                  {validation.isValid ? 'LaTeX is valid' : 'LaTeX needs fixing'}
                </span>
              </div>
              
              {validation.errors.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs font-medium text-yellow-300 mb-1">Issues found:</div>
                  <ul className="text-xs text-yellow-400 list-disc list-inside space-y-1">
                    {validation.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {validation.fixed && !validation.isValid && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-yellow-300">Suggested fix:</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleUseFixed}
                    className="h-6 text-xs bg-yellow-800/50 border-yellow-700 hover:bg-yellow-800"
                  >
                    Use Fixed Version
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {currentExpression && (
            <div className="p-3 bg-slate-900 border border-slate-700 rounded-md">
              <div className="text-xs text-muted-foreground mb-2">Preview:</div>
              <div className="min-h-[40px] flex items-center justify-center p-2 bg-gray-50 rounded text-black">
                {renderLatexPreview(validation.isValid ? currentExpression : validation.fixed || currentExpression)}
              </div>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            <p>LaTeX code: <code className="bg-slate-700 px-2 py-1 rounded border border-slate-600 font-mono text-xs">{currentExpression || "(empty)"}</code></p>
          </div>
        </div>

        {expressionCategories.map((category) => {
          const isExpanded = expandedCategories.has(category.category);
          
          return (
            <div key={category.category} className="border rounded-lg border-slate-700">
              <button
                onClick={() => toggleCategory(category.category)}
                className="w-full flex items-center justify-between p-3 hover:bg-slate-800 rounded-lg transition-colors"
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {category.expressions.map((expr, index) => (
                      <Button
                        key={`${expr.value}-${index}`}
                        variant="outline"
                        size="sm"
                        className="h-auto py-2 px-2 justify-center items-center min-h-[3rem] flex flex-col bg-slate-800 border-slate-700 hover:bg-slate-700 text-white"
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
        
        <div className="mt-4 p-3 bg-blue-900/50 border border-blue-700 rounded-lg text-xs text-blue-300">
          <p className="font-semibold mb-2">💡 PDF Conversion Issues:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Fraction lines going up:</strong> Usually caused by missing braces in exponents or nested fractions</li>
            <li><strong>Solution:</strong> Use proper LaTeX syntax: <code>x^{'{2}'}</code> not <code>x²</code></li>
            <li><strong>For complex fractions:</strong> Use <code>\frac{'{'}\frac{'{a}'}{'{b}'}{'}'}{'{c}'}</code> for nested fractions</li>
            <li>The validator will automatically detect and fix common issues</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
