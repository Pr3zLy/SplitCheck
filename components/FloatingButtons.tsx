import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ReceiptIcon, CalculatorIcon } from './icons';

interface FloatingButtonsProps {
    onCalculatorClick: () => void;
    onScrollClick: () => void;
    language: 'it' | 'en';
}

const translations = {
    it: {
        openCalculator: 'Apri calcolatrice',
        scrollToSummary: 'Vai al riepilogo',
    },
    en: {
        openCalculator: 'Open calculator',
        scrollToSummary: 'Scroll to summary',
    }
};

const FloatingButtons: React.FC<FloatingButtonsProps> = ({ onCalculatorClick, onScrollClick, language }) => {
    const t = translations[language];

    const fabRef = useRef<HTMLDivElement>(null);
    const [fabPosition, setFabPosition] = useState({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);
    const wasDraggedRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const initialFabPositionRef = useRef({ x: 0, y: 0 });
    const fabInitialRectRef = useRef<DOMRect | null>(null);

    useEffect(() => {
        if (fabRef.current) {
            fabInitialRectRef.current = fabRef.current.getBoundingClientRect();
        }
    }, []);

    const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDraggingRef.current) return;
        wasDraggedRef.current = true;
        
        // Prevent page scroll on touch devices while dragging
        if (e.type === 'touchmove') {
            e.preventDefault();
        }

        const initialRect = fabInitialRectRef.current;
        if (!initialRect) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const dx = clientX - dragStartRef.current.x;
        const dy = clientY - dragStartRef.current.y;

        let newX = initialFabPositionRef.current.x + dx;
        let newY = initialFabPositionRef.current.y + dy;

        const margin = 16; // 1rem boundary margin

        // Clamp X to stay within viewport
        if (initialRect.left + newX < margin) newX = margin - initialRect.left;
        if (initialRect.right + newX > window.innerWidth - margin) newX = window.innerWidth - margin - initialRect.right;
        
        // Clamp Y to stay within viewport
        if (initialRect.top + newY < margin) newY = margin - initialRect.top;
        if (initialRect.bottom + newY > window.innerHeight - margin) newY = window.innerHeight - margin - initialRect.bottom;

        setFabPosition({ x: newX, y: newY });
    }, []);

    const handleDragEnd = useCallback(() => {
        isDraggingRef.current = false;
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('touchmove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchend', handleDragEnd);
    }, [handleDragMove]);

    const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        isDraggingRef.current = true;
        wasDraggedRef.current = false;

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        dragStartRef.current = { x: clientX, y: clientY };
        initialFabPositionRef.current = fabPosition;

        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('touchmove', handleDragMove, { passive: false });
        document.addEventListener('mouseup', handleDragEnd);
        document.addEventListener('touchend', handleDragEnd);
    }, [fabPosition, handleDragMove, handleDragEnd]);

    return (
        <div
            ref={fabRef}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 cursor-grab active:cursor-grabbing"
            style={{ transform: `translate(${fabPosition.x}px, ${fabPosition.y}px)` }}
        >
            <button
                onClick={() => { if (!wasDraggedRef.current) onScrollClick(); }}
                className="bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:bg-primary/90 transition-transform hover:scale-110 active:scale-95 lg:hidden"
                aria-label={t.scrollToSummary}
            >
                <ReceiptIcon className="w-6 h-6" />
            </button>
            <button
                onClick={() => { if (!wasDraggedRef.current) onCalculatorClick(); }}
                className="bg-secondary text-secondary-foreground rounded-full p-4 shadow-lg hover:bg-secondary/80 transition-transform hover:scale-110 active:scale-95"
                aria-label={t.openCalculator}
            >
                <CalculatorIcon className="w-6 h-6" />
            </button>
        </div>
    );
};

export default FloatingButtons;