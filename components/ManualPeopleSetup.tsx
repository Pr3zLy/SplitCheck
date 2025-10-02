import React from 'react';
import { Person } from '../types';
import { PlusIcon, TrashIcon, UserIcon, ArrowLeftIcon } from './icons';

interface ManualPeopleSetupProps {
    people: Person[];
    setPeople: React.Dispatch<React.SetStateAction<Person[]>>;
    onNext: () => void;
    onBack: () => void;
}

const ManualPeopleSetup: React.FC<ManualPeopleSetupProps> = ({ people, setPeople, onNext, onBack }) => {
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

    return (
        <div className="animate-fade-in max-w-2xl mx-auto">
            <div className="mb-8 flex flex-col lg:grid lg:grid-cols-3 lg:items-center">
                <div className="w-full flex justify-start">
                    <button 
                        onClick={onBack}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors mb-4 lg:mb-0"
                        aria-label="Torna indietro"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        <span>Indietro</span>
                    </button>
                </div>
                <div className="text-center w-full lg:col-start-2">
                    <h2 className="text-3xl font-bold">Chi partecipa?</h2>
                    <p className="text-muted-foreground mt-2">
                        Aggiungi le persone che divideranno il conto.
                    </p>
                </div>
            </div>
            
            <div className="space-y-3 p-6 border border-border rounded-lg bg-card/50">
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
                        <button onClick={() => handleRemovePerson(person.id)} className="p-2 text-muted-foreground hover:text-destructive disabled:opacity-50" disabled={people.length <= 1}>
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                ))}
                <button onClick={handleAddPerson} className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-border rounded-md hover:border-primary hover:text-primary text-sm">
                    <PlusIcon className="w-5 h-5" />
                    Aggiungi persona
                </button>
            </div>
             <div className="mt-8 text-center">
                 <button 
                    onClick={onNext}
                    disabled={people.length === 0}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-primary/30"
                >
                    Avanti
                </button>
            </div>
        </div>
    );
};

export default ManualPeopleSetup;