import React, { useMemo, useState } from 'react';
import { Person, ReceiptItem } from '../types';
import { CopyIcon } from './icons';

interface SummaryViewProps {
    items: ReceiptItem[];
    people: Person[];
    language: 'it' | 'en';
}

const translations = {
    it: {
        summary: 'Riepilogo',
        copy: 'Copia',
        copied: 'Copiato!',
        grandTotal: 'Totale Generale',
        summaryTextTitle: 'Riepilogo Conto:',
    },
    en: {
        summary: 'Summary',
        copy: 'Copy',
        copied: 'Copied!',
        grandTotal: 'Grand Total',
        summaryTextTitle: 'Bill Summary:',
    }
};

const SummaryView: React.FC<SummaryViewProps> = ({ items, people, language }) => {
    const [copied, setCopied] = useState(false);
    const t = translations[language];

    const totals = useMemo(() => {
        return people.map(person => {
            let personTotal = 0;
            if (person.assignments) {
                for (const itemId in person.assignments) {
                    const item = items.find(i => i.id === itemId);
                    if (item) {
                        const portion = person.assignments[itemId];
                        personTotal += item.prezzo * item.quantita * portion;
                    }
                }
            }
            return {
                ...person,
                total: personTotal,
            };
        });
    }, [items, people]);

    const grandTotal = items.reduce((acc, item) => acc + item.prezzo * item.quantita, 0);

    const summaryText = useMemo(() => {
        let text = `${t.summaryTextTitle}\n------------------\n`;
        totals.forEach(p => {
            text += `${p.name}: €${p.total.toFixed(2)}\n`;
        });
        text += `------------------\n${t.grandTotal}: €${grandTotal.toFixed(2)}`;
        return text;
    }, [totals, grandTotal, t]);

    const handleCopy = () => {
        navigator.clipboard.writeText(summaryText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    
    if (people.length === 0) {
        return null;
    }

    return (
        <div className="bg-card border border-border rounded-lg p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{t.summary}</h3>
                <button onClick={handleCopy} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <CopyIcon className="w-4 h-4" />
                    {copied ? t.copied : t.copy}
                </button>
            </div>
            
            <div className="space-y-3">
                {totals.map(person => (
                    <div key={person.id} className="flex justify-between items-center text-foreground">
                        <span>{person.name}</span>
                        <span className="font-mono font-semibold">€{person.total.toFixed(2)}</span>
                    </div>
                ))}
            </div>
            
            <hr className="my-4 border-border" />

            <div className="flex justify-between items-center font-bold text-lg">
                <span>{t.grandTotal}</span>
                <span className="font-mono">€{grandTotal.toFixed(2)}</span>
            </div>
        </div>
    );
};

export default SummaryView;
