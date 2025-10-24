import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Person, ReceiptItem } from '../types';
import { PlusIcon, TrashIcon, ArrowLeftIcon, ListIcon, FocusIcon, UsersIcon, RandomIcon, ColosseumIcon } from './icons';
import SummaryView from './SummaryView';
import Calculator, { CalculatorState } from './Calculator';
import FloatingButtons from './FloatingButtons';

interface ManualItemEntryProps {
    items: ReceiptItem[];
    setItems: React.Dispatch<React.SetStateAction<ReceiptItem[]>>;
    people: Person[];
    setPeople: React.Dispatch<React.SetStateAction<Person[]>>;
    onBack: () => void;
    language: 'it' | 'en';
}

const translations = {
    it: {
        back: 'Indietro',
        title: 'Inserisci e Assegna',
        description: 'Aggiungi ogni articolo e assegnalo ai partecipanti. Il riepilogo si aggiornerà in tempo reale.',
        listView: 'Lista',
        focusView: 'Focus',
        splitAllRoman: 'Dividi tutto alla romana',
        product: 'Prodotto',
        quantity: 'Quantità',
        price: 'Prezzo',
        priceWithCurrency: 'Prezzo (€)',
        addItem: 'Aggiungi articolo',
        noItems: 'Nessun articolo.',
        addFirstItem: 'Aggiungi il primo articolo',
        itemOf: (current: number, total: number) => `Articolo ${current} di ${total}`,
        whoGotThis: 'Chi ha preso questo?',
        splitAmongAll: 'Dividi tra tutti',
        chooseRandomly: 'Scegli a caso',
        prev: 'Indietro',
        add: 'Aggiungi',
        next: 'Avanti',
        goBackToPeople: 'Torna alla selezione persone',
    },
    en: {
        back: 'Back',
        title: 'Enter & Assign',
        description: 'Add each item and assign it to the participants. The summary will update in real-time.',
        listView: 'List',
        focusView: 'Focus',
        splitAllRoman: 'Split everything evenly',
        product: 'Product',
        quantity: 'Quantity',
        price: 'Price',
        priceWithCurrency: 'Price (€)',
        addItem: 'Add item',
        noItems: 'No items.',
        addFirstItem: 'Add the first item',
        itemOf: (current: number, total: number) => `Item ${current} of ${total}`,
        whoGotThis: 'Who got this?',
        splitAmongAll: 'Split among all',
        chooseRandomly: 'Choose randomly',
        prev: 'Back',
        add: 'Add',
        next: 'Next',
        goBackToPeople: 'Go back to people selection',
    }
};

const ManualItemEntry: React.FC<ManualItemEntryProps> = ({ items, setItems, people, setPeople, onBack, language }) => {
    const [viewMode, setViewMode] = useState<'focus' | 'list'>('focus');
    const [focusIndex, setFocusIndex] = useState(0);
    const [isAnimatingRandom, setIsAnimatingRandom] = useState(false);
    const [highlightedPersonId, setHighlightedPersonId] = useState<string | null>(null);
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [calculatorState, setCalculatorState] = useState<CalculatorState>({
        expression: '0',
        lastExpression: '',
        calcHistory: [],
        isResult: false,
    });
    const summaryRef = useRef<HTMLDivElement>(null);
    const t = translations[language];
    
    const scrollToSummary = () => {
        summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const handleAddItem = useCallback(() => {
        setItems(prev => {
            const newItem: ReceiptItem = {
                id: crypto.randomUUID(),
                prodotto: language === 'it' ? `Prodotto ${prev.length + 1}` : `Item ${prev.length + 1}`,
                quantita: 1,
                prezzo: 0,
            };
            // Set focus to the newly created item
            if (viewMode === 'focus') {
                setFocusIndex(prev.length);
            }
            return [...prev, newItem];
        });
    }, [language, viewMode]);

    // Add first item if list is empty
    useEffect(() => {
        if (items.length === 0) {
            handleAddItem();
        }
    }, [items.length, handleAddItem]);

    const handleDeleteItem = (id: string) => {
        const itemIndex = items.findIndex(i => i.id === id);
        setItems(prev => prev.filter(item => item.id !== id));
        
        // Adjust focus index if necessary
        if (viewMode === 'focus' && focusIndex >= itemIndex && focusIndex > 0) {
            setFocusIndex(prev => prev - 1);
        }

        // Also remove assignments for this item from all people
        setPeople(prevPeople => prevPeople.map(p => {
            if (p.assignments && p.assignments[id]) {
                const newAssignments = { ...p.assignments };
                delete newAssignments[id];
                return { ...p, assignments: newAssignments };
            }
            return p;
        }));
    };

    const handleItemChange = (id: string, field: keyof Omit<ReceiptItem, 'id'>, value: string) => {
        setItems(prevItems =>
            prevItems.map(item => {
                if (item.id === id) {
                    if (field === 'prezzo' || field === 'quantita') {
                        // Allow comma as decimal separator
                        const numericValue = parseFloat(value.replace(',', '.'));
                        return { ...item, [field]: isNaN(numericValue) ? item[field] : numericValue };
                    }
                    return { ...item, [field]: value };
                }
                return item;
            })
        );
    };

    const handleAssignmentChange = (personId: string, itemId: string) => {
        setPeople(prevPeople => {
            const newPeople = prevPeople.map(p => ({
                ...p,
                assignments: { ...p.assignments }
            }));

            const person = newPeople.find(p => p.id === personId);
            if (!person) return prevPeople;

            const isAssigned = person.assignments?.[itemId];

            if (isAssigned) {
                delete person.assignments![itemId];
            } else {
                if (!person.assignments) person.assignments = {};
                person.assignments[itemId] = 1; // Placeholder, will be recalculated
            }

            // Recalculate portions for the changed item
            const assignedPeopleForItem = newPeople.filter(p => p.assignments?.[itemId]);
            const portion = assignedPeopleForItem.length > 0 ? 1 / assignedPeopleForItem.length : 0;
            
            newPeople.forEach(p => {
                if (p.assignments?.[itemId]) {
                    p.assignments[itemId] = portion;
                }
            });

            return newPeople;
        });
    };
    
    const handleSplitAllRoman = () => {
        setPeople(prevPeople => {
            const newPeople = [...prevPeople];
            if (newPeople.length === 0) return newPeople;
            
            const portion = 1 / newPeople.length;

            items.forEach(item => {
                newPeople.forEach(person => {
                    if (!person.assignments) person.assignments = {};
                    person.assignments[item.id] = portion;
                });
            });

            return newPeople;
        });
    };

    const handleSplitItemRoman = (itemId: string) => {
        setPeople(prevPeople => {
            const newPeople = prevPeople.map(p => ({
                ...p,
                assignments: { ...p.assignments }
            }));

            if (newPeople.length === 0) return newPeople;

            const portion = 1 / newPeople.length;
            
            newPeople.forEach(person => {
                if (!person.assignments) person.assignments = {};
                person.assignments[itemId] = portion;
            });

            return newPeople;
        });
    };

    const handleAssignRandomly = (itemId: string) => {
        if (people.length === 0 || isAnimatingRandom) return;

        setIsAnimatingRandom(true);
        setHighlightedPersonId(null);

        const animationDuration = 2000; // 2 seconds
        const intervalTime = 100; // highlight a new person every 100ms
        let animationInterval: number;

        // Start cycling through people
        animationInterval = window.setInterval(() => {
            const randomIndex = Math.floor(Math.random() * people.length);
            setHighlightedPersonId(people[randomIndex].id);
        }, intervalTime);

        // After animation duration, pick the winner and stop
        setTimeout(() => {
            clearInterval(animationInterval);

            const winnerIndex = Math.floor(Math.random() * people.length);
            const winner = people[winnerIndex];
            setHighlightedPersonId(winner.id);

            setPeople(prevPeople => {
                const newPeople = prevPeople.map(p => ({
                    ...p,
                    assignments: { ...p.assignments }
                }));
                
                // Clear the assignment for this item for ALL people first
                newPeople.forEach(p => {
                    if (p.assignments) {
                        delete p.assignments[itemId];
                    }
                });

                // Find the winner in the new array and assign the item
                const winnerPerson = newPeople.find(p => p.id === winner.id);
                if (winnerPerson) {
                    if (!winnerPerson.assignments) {
                        winnerPerson.assignments = {};
                    }
                    winnerPerson.assignments[itemId] = 1; // Assign fully to the winner
                }

                return newPeople;
            });

            // End animation state after a short delay to show the final result
            setTimeout(() => {
                setIsAnimatingRandom(false);
                setHighlightedPersonId(null);
            }, 500);

        }, animationDuration);
    };

    const ViewModeSwitcher = () => (
        <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
            <button 
                onClick={() => setViewMode('list')} 
                className={`px-2 py-1 text-sm rounded-md flex items-center gap-1.5 transition-colors ${viewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                aria-label={t.listView}
            >
                <ListIcon className="w-4 h-4" />
                <span>{t.listView}</span>
            </button>
            <button 
                onClick={() => setViewMode('focus')}
                className={`px-2 py-1 text-sm rounded-md flex items-center gap-1.5 transition-colors ${viewMode === 'focus' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                aria-label={t.focusView}
            >
                <FocusIcon className="w-4 h-4" />
                <span>{t.focusView}</span>
            </button>
        </div>
    );
    
    const renderListView = () => (
        <>
            <div className="space-y-3">
                {/* Header */}
                <div className="hidden md:grid grid-cols-12 gap-x-3 items-center px-3 text-sm font-medium text-muted-foreground">
                    <div className="col-span-6">{t.product}</div>
                    <div className="col-span-2">{t.quantity}</div>
                    <div className="col-span-2">{t.price}</div>
                    <div className="col-span-2"></div>
                </div>

                {items.length > 0 ? items.map((item) => (
                    <div key={item.id} className="p-3 border bg-card rounded-lg space-y-3">
                        <div className="grid grid-cols-12 gap-x-3 gap-y-2 items-center">
                            {/* Prodotto */}
                            <div className="col-span-12 md:col-span-6">
                                <label htmlFor={`item-name-${item.id}`} className="text-xs font-medium text-muted-foreground md:hidden">{t.product}</label>
                                <input id={`item-name-${item.id}`} type="text" value={item.prodotto} onFocus={(e) => e.target.select()} onChange={(e) => handleItemChange(item.id, 'prodotto', e.target.value)} className="w-full bg-input border border-border rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-ring focus:border-primary outline-none" />
                            </div>
                            {/* Quantità */}
                            <div className="col-span-6 md:col-span-2">
                                <label htmlFor={`item-qty-${item.id}`} className="text-xs font-medium text-muted-foreground md:hidden">{t.quantity}</label>
                                <input id={`item-qty-${item.id}`} type="number" value={item.quantita} onFocus={(e) => e.target.select()} onChange={(e) => handleItemChange(item.id, 'quantita', e.target.value)} className="w-full bg-input border border-border rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-ring focus:border-primary outline-none" min="0" step="any" />
                            </div>
                            {/* Prezzo */}
                            <div className="col-span-6 md:col-span-2">
                                <label htmlFor={`item-price-${item.id}`} className="text-xs font-medium text-muted-foreground md:hidden">{t.priceWithCurrency}</label>
                                <input id={`item-price-${item.id}`} type="number" value={item.prezzo} onFocus={(e) => e.target.select()} onChange={(e) => handleItemChange(item.id, 'prezzo', e.target.value)} className="w-full bg-input border border-border rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-ring focus:border-primary outline-none" min="0" step="0.01" />
                            </div>
                             {/* Delete */}
                            <div className="col-span-12 md:col-span-2 flex justify-end">
                                <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-muted-foreground hover:text-destructive"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                         {/* Assignments */}
                         <hr className="border-border" />
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {people.map(person => (
                                <label key={person.id} className={`flex items-center gap-2 p-2 border rounded-md cursor-pointer transition-colors text-sm ${person.assignments?.[item.id] ? 'bg-primary/10 border-primary' : 'bg-muted/50 hover:bg-accent'}`}>
                                    <input type="checkbox" checked={!!person.assignments?.[item.id]} onChange={() => handleAssignmentChange(person.id, item.id)} className="w-4 h-4 rounded text-primary bg-transparent border-border focus:ring-primary focus:ring-1 focus:ring-offset-2 focus:ring-offset-background" />
                                    <span className="font-medium truncate">{person.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )) : null}
            </div>
            <button onClick={handleAddItem} className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-border rounded-md hover:border-primary hover:text-primary text-sm">
                <PlusIcon className="w-5 h-5" />
                {t.addItem}
            </button>
        </>
    );

    const renderFocusView = () => {
        const currentFocusItem = items[focusIndex];
        if (!currentFocusItem) {
             return (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground">{t.noItems}</p>
                    <button onClick={handleAddItem} className="mt-4 flex items-center mx-auto gap-2 px-4 py-2 border border-dashed border-border rounded-md hover:border-primary hover:text-primary text-sm">
                        <PlusIcon className="w-5 h-5" />
                        {t.addFirstItem}
                    </button>
                </div>
            );
        }

        return (
            <div className="relative border border-border bg-card rounded-lg p-6 shadow-sm">
                <div className="absolute top-0 left-0 right-0 h-1 bg-muted rounded-t-lg">
                    <div className="bg-primary h-1 rounded-t-lg transition-all duration-300" style={{ width: `${((focusIndex + 1) / items.length) * 100}%` }}></div>
                </div>

                <div className="text-center pt-2">
                    <p className="text-sm text-muted-foreground">{t.itemOf(focusIndex + 1, items.length)}</p>
                </div>

                <div className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="focus-prodotto" className="text-sm font-medium text-muted-foreground">{t.product}</label>
                        <input id="focus-prodotto" type="text" value={currentFocusItem.prodotto} onFocus={(e) => e.target.select()} onChange={(e) => handleItemChange(currentFocusItem.id, 'prodotto', e.target.value)} className="w-full mt-1 bg-input border border-border rounded-md px-3 py-2 text-base font-semibold focus:ring-2 focus:ring-ring focus:border-primary outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label htmlFor="focus-quantita" className="text-sm font-medium text-muted-foreground">{t.quantity}</label>
                             <input id="focus-quantita" type="number" value={currentFocusItem.quantita} onFocus={(e) => e.target.select()} onChange={(e) => handleItemChange(currentFocusItem.id, 'quantita', e.target.value)} className="w-full mt-1 bg-input border border-border rounded-md px-3 py-2 text-base focus:ring-2 focus:ring-ring focus:border-primary outline-none" min="0" step="any"/>
                        </div>
                        <div>
                            <label htmlFor="focus-prezzo" className="text-sm font-medium text-muted-foreground">{t.priceWithCurrency}</label>
                            <input id="focus-prezzo" type="number" value={currentFocusItem.prezzo} onFocus={(e) => e.target.select()} onChange={(e) => handleItemChange(currentFocusItem.id, 'prezzo', e.target.value)} className="w-full mt-1 bg-input border border-border rounded-md px-3 py-2 text-base focus:ring-2 focus:ring-ring focus:border-primary outline-none" min="0" step="0.01"/>
                        </div>
                    </div>
                </div>

                <hr className="my-6 border-border" />

                <div>
                    <h5 className="font-semibold mb-3 text-center">{t.whoGotThis}</h5>
                     <div className="flex justify-center items-center gap-3 mb-4">
                        <button
                            onClick={() => handleSplitItemRoman(currentFocusItem.id)}
                            className="flex items-center gap-2 px-3 py-1.5 border border-dashed border-border rounded-full hover:border-primary hover:text-primary text-sm justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            disabled={people.length < 1 || isAnimatingRandom}
                        >
                            <UsersIcon className="w-4 h-4" />
                            <span>{t.splitAmongAll}</span>
                        </button>
                        <button
                            onClick={() => handleAssignRandomly(currentFocusItem.id)}
                            className="flex items-center gap-2 px-3 py-1.5 border border-dashed border-border rounded-full hover:border-primary hover:text-primary text-sm justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            disabled={people.length < 1 || isAnimatingRandom}
                        >
                            <RandomIcon className="w-4 h-4" />
                            <span>{t.chooseRandomly}</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {people.map(person => (
                            <label key={person.id} 
                                className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-all duration-150
                                ${person.assignments?.[currentFocusItem.id] ? 'bg-primary/10 border-primary ring-1 ring-primary' : 'bg-muted/50 hover:bg-accent'}
                                ${highlightedPersonId === person.id ? 'ring-2 ring-offset-2 ring-yellow-400 scale-105 shadow-lg' : ''}
                                ${isAnimatingRandom ? 'cursor-wait' : ''}
                            `}>
                                <input
                                    type="checkbox"
                                    checked={!!person.assignments?.[currentFocusItem.id]}
                                    onChange={() => handleAssignmentChange(person.id, currentFocusItem.id)}
                                    disabled={isAnimatingRandom}
                                    className="w-5 h-5 rounded text-primary bg-transparent border-border focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-wait"
                                />
                                <span className="font-medium truncate">{person.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between items-center mt-8">
                    <button onClick={() => setFocusIndex(prev => prev - 1)} disabled={focusIndex === 0 || isAnimatingRandom} className="px-5 py-2 rounded-md font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50">{t.prev}</button>
                    <button onClick={() => handleDeleteItem(currentFocusItem.id)} disabled={isAnimatingRandom} className="p-2 text-muted-foreground hover:text-destructive disabled:opacity-50"><TrashIcon className="w-5 h-5" /></button>
                    {focusIndex === items.length - 1 ? (
                        <button onClick={handleAddItem} disabled={isAnimatingRandom} className="px-5 py-2 rounded-md font-semibold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50"><PlusIcon className="w-5 h-5"/> {t.add}</button>
                    ) : (
                        <button onClick={() => setFocusIndex(prev => prev + 1)} disabled={focusIndex >= items.length - 1 || isAnimatingRandom} className="px-5 py-2 rounded-md font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{t.next}</button>
                    )}
                </div>
            </div>
        );
    }
    
    return (
        <div className="animate-fade-in">
            <div className="relative mb-8 flex flex-col items-center">
                <div className="w-full flex justify-start lg:absolute lg:left-0 lg:top-1/2 lg:-translate-y-1/2 lg:w-auto">
                    <button onClick={onBack} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors mb-4 lg:mb-0" aria-label={t.goBackToPeople}>
                        <ArrowLeftIcon className="w-4 h-4" />
                        <span>{t.back}</span>
                    </button>
                </div>
                <div className="text-center w-full">
                    <h2 className="text-3xl font-bold">{t.title}</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                        {t.description}
                    </p>
                </div>
                 <div className="lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 mt-4 lg:mt-0">
                    <ViewModeSwitcher />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Summary Column */}
                <div ref={summaryRef} className="lg:col-span-2 lg:sticky lg:top-28 self-start space-y-4">
                    <SummaryView items={items} people={people} language={language} />
                     <div className="bg-card border border-border rounded-lg p-4">
                        <button onClick={handleSplitAllRoman} disabled={items.length === 0 || people.length === 0} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                            <ColosseumIcon className="w-8 h-8" />
                            {t.splitAllRoman}
                        </button>
                    </div>
                </div>

                {/* Item Entry and Assignment Column */}
                <div className="lg:col-span-3">
                    {viewMode === 'list' ? renderListView() : renderFocusView()}
                </div>
            </div>
            
            <FloatingButtons 
                onCalculatorClick={() => setIsCalculatorOpen(true)}
                onScrollClick={scrollToSummary}
                language={language}
            />
            
            {isCalculatorOpen && <Calculator onClose={() => setIsCalculatorOpen(false)} state={calculatorState} setState={setCalculatorState} />}
        </div>
    );
};

export default ManualItemEntry;
