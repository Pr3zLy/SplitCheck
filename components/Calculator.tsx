import React from 'react';
import { XIcon } from './icons';

export interface CalculatorState {
    expression: string;
    lastExpression: string;
    calcHistory: string[];
    isResult: boolean;
}

interface CalculatorProps {
  onClose: () => void;
  state: CalculatorState;
  setState: React.Dispatch<React.SetStateAction<CalculatorState>>;
}

interface CalculatorButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
}

const CalculatorButton = ({ onClick, children, className = '' }: CalculatorButtonProps) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-center text-xl sm:text-2xl font-semibold rounded-full aspect-square transition-colors duration-150 active:scale-95 ${className}`}
    >
        {children}
    </button>
);

const Calculator: React.FC<CalculatorProps> = ({ onClose, state, setState }) => {
    const { expression, lastExpression, calcHistory, isResult } = state;

    const handleInput = (input: string) => {
        if (isResult) {
            setState(s => ({ ...s, expression: input, isResult: false }));
            return;
        }

        setState(s => {
            if (s.expression === '0' && input !== '.') return { ...s, expression: input };
            if (input === '.' && s.expression.split(/[\+\-×÷\(\)]/).pop()?.includes('.')) return s;
            return { ...s, expression: s.expression + input };
        });
    };
    
    const handleOperator = (op: string) => {
        setState(s => {
            const lastChar = s.expression.trim().slice(-1);
            if (['+', '-', '×', '÷'].includes(lastChar)) {
                return { ...s, isResult: false, expression: s.expression.slice(0, -1) + op };
            }
            return { ...s, isResult: false, expression: s.expression + op };
        });
    };
    
    const evaluate = () => {
        if (isResult) return;
        try {
            // Basic validation for parentheses balance
            if ((expression.match(/\(/g) || []).length !== (expression.match(/\)/g) || []).length) {
                throw new Error("Mismatched parentheses");
            }
            
            // Sanitize for evaluation and check for invalid characters
            const sanitizedExpression = expression.replace(/×/g, '*').replace(/÷/g, '/');
            if (/[^0-9+\-*/().\s]/.test(sanitizedExpression)) {
                 throw new Error("Invalid characters");
            }

            // Using Function constructor is a slightly safer alternative to direct eval
            const result = new Function('return ' + sanitizedExpression)();
            
            if (isNaN(result) || !isFinite(result)) {
                throw new Error("Invalid operation");
            }
            
            // Format to max 2 decimal places and remove trailing zeros
            const finalResult = String(Number(result.toFixed(2)));

            setState(s => ({
                expression: finalResult,
                lastExpression: `${s.expression} =`,
                calcHistory: [...s.calcHistory.slice(-4), `${s.expression} = ${finalResult}`],
                isResult: true
            }));
        } catch (error) {
            setState(s => ({
                ...s,
                expression: 'Error',
                lastExpression: s.expression,
                isResult: true,
            }));
        }
    };
    
    const clear = () => {
        setState({
            expression: '0',
            lastExpression: '',
            calcHistory: [],
            isResult: false
        });
    };
    
    const del = () => {
        if (isResult) {
            clear();
            return;
        }
        setState(s => ({ ...s, expression: s.expression.length > 1 ? s.expression.slice(0, -1) : '0'}));
    };
    
    const formattedOperand = (operand: string) => {
        try {
            const parts = operand.split(/([\+\-×÷\(\)])/);
            return parts.map((part, index) => {
                if (!isNaN(parseFloat(part)) && isFinite(Number(part))) {
                     const [integer, decimal] = part.split('.');
                     const integerDisplay = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(integer));
                     if (decimal != null) {
                         return `${integerDisplay}.${decimal}`;
                     }
                     return integerDisplay;
                }
                return part;
            }).join('');
        } catch {
            return operand;
        }
    }

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="relative bg-neutral-800/80 text-white rounded-3xl shadow-2xl p-4 w-full max-w-[18rem] border border-neutral-700/50 flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-2 right-2 p-1 text-neutral-400 hover:text-white z-10">
                    <XIcon className="w-5 h-5"/>
                </button>

                {/* History Display */}
                <div className="h-20 text-center flex flex-col justify-end items-center text-neutral-400 text-sm overflow-y-auto pb-1">
                    {calcHistory.map((item, index) => (
                        <div key={index} className="truncate">{item}</div>
                    ))}
                </div>

                {/* Main Display */}
                <div className="h-24 text-center flex flex-col justify-end items-center p-4 break-words border-t border-neutral-700/50">
                     <div className="text-neutral-400 text-lg h-6 truncate w-full">{lastExpression}</div>
                     <div className="text-4xl font-light tracking-tight truncate w-full">{formattedOperand(expression)}</div>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-4 gap-3 pt-4">
                    <CalculatorButton onClick={clear} className="bg-neutral-500/80 hover:bg-neutral-500/60 text-black">C</CalculatorButton>
                    <CalculatorButton onClick={() => handleInput('(')} className="bg-neutral-700/80 hover:bg-neutral-700/60">(</CalculatorButton>
                    <CalculatorButton onClick={() => handleInput(')')} className="bg-neutral-700/80 hover:bg-neutral-700/60">)</CalculatorButton>
                    <CalculatorButton onClick={() => handleOperator('÷')} className="bg-primary hover:bg-primary/80">÷</CalculatorButton>

                    <CalculatorButton onClick={() => handleInput('7')} className="bg-neutral-700/80 hover:bg-neutral-700/60">7</CalculatorButton>
                    <CalculatorButton onClick={() => handleInput('8')} className="bg-neutral-700/80 hover:bg-neutral-700/60">8</CalculatorButton>
                    <CalculatorButton onClick={() => handleInput('9')} className="bg-neutral-700/80 hover:bg-neutral-700/60">9</CalculatorButton>
                    <CalculatorButton onClick={() => handleOperator('×')} className="bg-primary hover:bg-primary/80">×</CalculatorButton>
                    
                    <CalculatorButton onClick={() => handleInput('4')} className="bg-neutral-700/80 hover:bg-neutral-700/60">4</CalculatorButton>
                    <CalculatorButton onClick={() => handleInput('5')} className="bg-neutral-700/80 hover:bg-neutral-700/60">5</CalculatorButton>
                    <CalculatorButton onClick={() => handleInput('6')} className="bg-neutral-700/80 hover:bg-neutral-700/60">6</CalculatorButton>
                    <CalculatorButton onClick={() => handleOperator('-')} className="bg-primary hover:bg-primary/80">-</CalculatorButton>
                    
                    <CalculatorButton onClick={() => handleInput('1')} className="bg-neutral-700/80 hover:bg-neutral-700/60">1</CalculatorButton>
                    <CalculatorButton onClick={() => handleInput('2')} className="bg-neutral-700/80 hover:bg-neutral-700/60">2</CalculatorButton>
                    <CalculatorButton onClick={() => handleInput('3')} className="bg-neutral-700/80 hover:bg-neutral-700/60">3</CalculatorButton>
                    <CalculatorButton onClick={() => handleOperator('+')} className="bg-primary hover:bg-primary/80">+</CalculatorButton>
                    
                    <CalculatorButton onClick={del} className="bg-neutral-700/80 hover:bg-neutral-700/60">DEL</CalculatorButton>
                    <CalculatorButton onClick={() => handleInput('0')} className="bg-neutral-700/80 hover:bg-neutral-700/60">0</CalculatorButton>
                    <CalculatorButton onClick={() => handleInput('.')} className="bg-neutral-700/80 hover:bg-neutral-700/60">.</CalculatorButton>
                    <CalculatorButton onClick={evaluate} className="bg-primary hover:bg-primary/80">=</CalculatorButton>
                </div>
            </div>
        </div>
    );
};

export default Calculator;
