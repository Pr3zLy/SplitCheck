import React, { useMemo, useState } from 'react';
import { Person, ReceiptItem } from '../types';
import { PlusIcon, TrashIcon, UserIcon, UsersIcon, ListIcon, FocusIcon, ArrowLeftIcon, ColosseumIcon, RandomIcon } from './icons';
import SummaryView from './SummaryView';

interface PeopleAssignerProps {
    items: ReceiptItem[];
    people: Person[];
    setPeople: React.Dispatch<React.SetStateAction<Person[]>>;
    onBack: () => void;
}

const PeopleAssigner: React.FC<PeopleAssignerProps> = ({ items, people, setPeople, onBack }) => {
    const [viewMode, setViewMode] = useState<'list' | 'focus'>('focus');
    const [focusIndex, setFocusIndex] = useState(0);
    const [isAnimatingRandom, setIsAnimatingRandom] = useState(false);
    const [highlightedPersonId, setHighlightedPersonId] = useState<string | null>(null);
    
    const handleAddPerson = () => {
        setPeople(prev => [
            ...prev,
            { id: crypto.randomUUID(), name: `Persona ${prev.length + 1}`, assignments: {} }
        ]);
    };

    const handleRemovePerson = (id: string) => {
        setPeople(prev => prev.filter(p => p.id !== id));
    };

    const handlePersonNameChange = (id: string, name: string) => {
        setPeople(prev => prev.map(p => p.id === id ? { ...p, name } : p));
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

    const handleAssignmentChange = (personId: string, itemId: string) => {
        setPeople(prevPeople => {
            const newPeople = prevPeople.map(p => ({
                ...p,
                assignments: { ...p.assignments }
            }));

            const isAssigned = newPeople.find(p => p.id === personId)?.assignments?.[itemId];

            if (isAssigned) {
                delete newPeople.find(p => p.id === personId)!.assignments![itemId];
            } else {
                const personToAssign = newPeople.find(p => p.id === personId);
                if (personToAssign) {
                    if (!personToAssign.assignments) personToAssign.assignments = {};
                    personToAssign.assignments[itemId] = 1; // Placeholder
                }
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

    const unassignedItems = useMemo(() => {
        return items.filter(item => {
            return !people.some(person => person.assignments?.[item.id] && person.assignments?.[item.id] > 0);
        });
    }, [items, people]);

    const UnassignedWarning = () => {
        if (unassignedItems.length === 0) return null;
        return (
            <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-md text-yellow-800 dark:text-yellow-200 text-sm">
                <strong>Attenzione:</strong> {unassignedItems.length} {unassignedItems.length === 1 ? 'articolo non è stato assegnato' : 'articoli non sono stati assegnati'}.
            </div>
        );
    };

    const ViewModeSwitcher = () => (
        <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
            <button 
                onClick={() => setViewMode('list')} 
                className={`px-2 py-1 text-sm rounded-md flex items-center gap-1.5 transition-colors ${viewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                aria-label="Vista a lista"
            >
                <ListIcon className="w-4 h-4" />
                <span>Lista</span>
            </button>
            <button 
                onClick={() => setViewMode('focus')}
                className={`px-2 py-1 text-sm rounded-md flex items-center gap-1.5 transition-colors ${viewMode === 'focus' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                aria-label="Vista focus"
            >
                <FocusIcon className="w-4 h-4" />
                <span>Focus</span>
            </button>
        </div>
    );

    const renderListView = () => (
        <>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold">Assegna Articoli</h3>
                <ViewModeSwitcher />
            </div>
            <div className="overflow-x-auto border border-border rounded-lg bg-card">
                <table className="w-full text-left text-sm">
                    <thead className="bg-muted">
                        <tr className="border-b border-border">
                            <th className="sticky left-0 bg-muted p-3 font-medium text-muted-foreground z-10">Articolo</th>
                            <th className="p-3 font-medium text-muted-foreground text-center" title="Dividi alla romana">Dividi</th>
                            {people.map(p => <th key={p.id} className="px-2 py-3 text-center font-medium text-muted-foreground whitespace-nowrap">{p.name}</th>)}
                            <th className="sticky right-0 bg-muted p-3 text-right font-medium text-muted-foreground z-10">Prezzo</th>
                        </tr>
                    </thead>
                    <tbody className="text-card-foreground">
                        {items.map(item => (
                            <tr key={item.id} className="group border-b border-border last:border-b-0 hover:bg-accent transition-colors">
                                <td className="sticky left-0 bg-card group-hover:bg-accent p-3 z-10 whitespace-nowrap">{item.prodotto} <span className="text-muted-foreground text-xs">x{item.quantita}</span></td>
                                <td className="p-3 text-center">
                                    <button
                                        onClick={() => handleSplitItemRoman(item.id)}
                                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors disabled:opacity-50"
                                        aria-label="Dividi questo articolo alla romana"
                                        disabled={people.length < 1}
                                    >
                                        <UsersIcon className="w-5 h-5" />
                                    </button>
                                </td>
                                {people.map(person => (
                                    <td key={person.id} className="px-2 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={!!person.assignments?.[item.id]}
                                            onChange={() => handleAssignmentChange(person.id, item.id)}
                                            className="w-5 h-5 rounded text-primary bg-input border-border focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:ring-offset-background"
                                        />
                                    </td>
                                ))}
                                <td className="sticky right-0 bg-card group-hover:bg-accent p-3 text-right font-mono z-10">€{(item.prezzo * item.quantita).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <p className="text-xs text-center text-muted-foreground mt-2 md:hidden">
                Scorri la tabella per vedere tutti i partecipanti &rarr;
            </p>
            <UnassignedWarning />
        </>
    );

    const renderFocusView = () => {
        const currentFocusItem = items[focusIndex];

        return (
            <>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-semibold">Assegna Articoli</h3>
                    <ViewModeSwitcher />
                </div>
                
                {items.length > 0 && currentFocusItem ? (
                    <div className="relative border border-border bg-card rounded-lg p-6 shadow-sm">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-muted rounded-t-lg">
                            <div className="bg-primary h-1 rounded-t-lg transition-all duration-300" style={{ width: `${((focusIndex + 1) / items.length) * 100}%` }}></div>
                        </div>

                        <div className="text-center pt-2">
                            <p className="text-sm text-muted-foreground">Articolo {focusIndex + 1} di {items.length}</p>
                            <h4 className="text-2xl font-bold mt-2">{currentFocusItem.prodotto}</h4>
                            <p className="text-muted-foreground">Quantità: {currentFocusItem.quantita}</p>
                            <p className="text-3xl font-mono font-bold mt-2">€{(currentFocusItem.prezzo * currentFocusItem.quantita).toFixed(2)}</p>
                        </div>

                        <hr className="my-6 border-border" />

                        <div>
                            <h5 className="font-semibold mb-3 text-center">Chi ha preso questo?</h5>
                             <div className="flex justify-center items-center gap-3 mb-4">
                                <button
                                    onClick={() => handleSplitItemRoman(currentFocusItem.id)}
                                    className="flex items-center gap-2 px-3 py-1.5 border border-dashed border-border rounded-full hover:border-primary hover:text-primary text-sm justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    disabled={people.length < 1 || isAnimatingRandom}
                                >
                                    <UsersIcon className="w-4 h-4" />
                                    <span>Dividi tra tutti</span>
                                </button>
                                <button
                                    onClick={() => handleAssignRandomly(currentFocusItem.id)}
                                    className="flex items-center gap-2 px-3 py-1.5 border border-dashed border-border rounded-full hover:border-primary hover:text-primary text-sm justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    disabled={people.length < 1 || isAnimatingRandom}
                                >
                                    <RandomIcon className="w-4 h-4" />
                                    <span>Scegli a caso</span>
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

                        <div className="flex justify-between mt-8">
                            <button 
                                onClick={() => setFocusIndex(prev => prev - 1)} 
                                disabled={focusIndex === 0 || isAnimatingRandom}
                                className="px-6 py-2 rounded-md font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Indietro
                            </button>
                            <button 
                                onClick={() => setFocusIndex(prev => prev + 1)} 
                                disabled={focusIndex >= items.length - 1 || isAnimatingRandom}
                                className="px-6 py-2 rounded-md font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Avanti
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                        <p className="text-muted-foreground">Nessun articolo da assegnare.</p>
                    </div>
                )}
                <UnassignedWarning />
            </>
        );
    }


    return (
        <div className="animate-fade-in">
            <div className="relative mb-8 flex flex-col items-center">
                <div className="w-full flex justify-start lg:absolute lg:left-0 lg:top-1/2 lg:-translate-y-1/2 lg:w-auto">
                    <button 
                        onClick={onBack}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors mb-4 lg:mb-0"
                        aria-label="Torna alla modifica degli articoli"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        <span>Indietro</span>
                    </button>
                </div>
                <div className="text-center w-full">
                    <h2 className="text-3xl font-bold">Dividi il Conto</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                        Aggiungi le persone e assegna ogni articolo. Scegli la vista che preferisci: a lista o focus.
                    </p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* People List & Summary Column */}
                <div className="lg:col-span-2 lg:sticky lg:top-28 self-start space-y-4">
                    <div className="space-y-3 p-4 border border-border rounded-lg bg-card/50">
                        <h3 className="text-xl font-semibold mb-2">Partecipanti</h3>
                        {people.map(person => (
                            <div key={person.id} className="flex items-center gap-3">
                                <UserIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                <input
                                    type="text"
                                    value={person.name}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => handlePersonNameChange(person.id, e.target.value)}
                                    className="flex-grow bg-input border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:border-primary outline-none"
                                    placeholder="Nome persona"
                                />
                                <button onClick={() => handleRemovePerson(person.id)} className="p-2 text-muted-foreground hover:text-destructive disabled:opacity-50" disabled={people.length <= 1} tabIndex={-1}>
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                        <button onClick={handleAddPerson} className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-border rounded-md hover:border-primary hover:text-primary text-sm">
                            <PlusIcon className="w-5 h-5" />
                            Aggiungi persona
                        </button>
                        <button onClick={handleSplitAllRoman} className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 text-sm font-semibold">
                            <ColosseumIcon className="w-8 h-8" />
                            Dividi tutto alla romana
                        </button>
                    </div>

                    <SummaryView items={items} people={people} />
                </div>
                
                <div className="lg:col-span-3">
                    {viewMode === 'list' ? renderListView() : renderFocusView()}
                </div>
            </div>
        </div>
    );
};

export default PeopleAssigner;