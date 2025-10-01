import React, { useState, useEffect } from 'react';
import { ReceiptItem } from '../types';
import { PlusIcon, TrashIcon } from './icons';
import AppendReceiptUpload from './AppendReceiptUpload';

interface ItemEditorProps {
    items: ReceiptItem[];
    setItems: React.Dispatch<React.SetStateAction<ReceiptItem[]>>;
    onNext: () => void;
    imageUrls: string[];
    onAppendReceipt: (file: File) => void;
    isAppending: boolean;
    appendError: string | null;
}

const ItemEditor: React.FC<ItemEditorProps> = ({ items, setItems, onNext, imageUrls, onAppendReceipt, isAppending, appendError }) => {
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setSelectedImageUrl(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // FIX: Changed `value` parameter type from `string | number` to `string` to match input event values
    // and ensure type compatibility with `ReceiptItem`. Also removed redundant `String()` conversion.
    const handleItemChange = (id: string, field: keyof Omit<ReceiptItem, 'id'>, value: string) => {
        setItems(prevItems =>
            prevItems.map(item => {
                if (item.id === id) {
                    if (field === 'prezzo' || field === 'quantita') {
                        const numericValue = parseFloat(value);
                        return { ...item, [field]: isNaN(numericValue) ? item[field] : numericValue };
                    }
                    return { ...item, [field]: value };
                }
                return item;
            })
        );
    };

    const handleAddItem = () => {
        const newItem: ReceiptItem = {
            id: crypto.randomUUID(),
            prodotto: '',
            quantita: 1,
            prezzo: 0,
        };
        setItems(prev => [...prev, newItem]);
    };

    const handleDeleteItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const total = items.reduce((acc, item) => acc + (item.prezzo * item.quantita), 0);
    
    const itemRows = items.map((item) => (
        <div key={item.id} className="grid grid-cols-12 gap-x-3 gap-y-2 items-center p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            {/* Prodotto */}
            <div className="col-span-10 md:col-span-5 order-1 md:order-1">
                <label htmlFor={`item-name-${item.id}`} className="text-xs font-medium text-muted-foreground md:hidden">Prodotto</label>
                <input
                    id={`item-name-${item.id}`}
                    type="text"
                    value={item.prodotto}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => handleItemChange(item.id, 'prodotto', e.target.value)}
                    className="w-full bg-transparent focus:outline-none"
                    placeholder="Nome prodotto"
                />
            </div>

            {/* Quantità */}
            <div className="col-span-4 md:col-span-2 order-3 md:order-2">
                 <label htmlFor={`item-qty-${item.id}`} className="text-xs font-medium text-muted-foreground md:hidden">Quantità</label>
                <input
                    id={`item-qty-${item.id}`}
                    type="number"
                    value={item.quantita}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => handleItemChange(item.id, 'quantita', e.target.value)}
                    className="w-full bg-transparent focus:outline-none"
                    placeholder="1"
                    min="0"
                    step="any"
                />
            </div>

            {/* Prezzo */}
            <div className="col-span-4 md:col-span-2 order-4 md:order-3">
                 <label htmlFor={`item-price-${item.id}`} className="text-xs font-medium text-muted-foreground md:hidden">Prezzo Unit.</label>
                 <div className="flex items-center">
                    <span className="text-muted-foreground mr-1">€</span>
                    <input
                        id={`item-price-${item.id}`}
                        type="number"
                        value={item.prezzo}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => handleItemChange(item.id, 'prezzo', e.target.value)}
                        className="w-full bg-transparent focus:outline-none"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                    />
                 </div>
            </div>

            {/* Totale Riga */}
            <div className="col-span-4 md:col-span-2 text-right order-5 md:order-4">
                <label className="text-xs font-medium text-muted-foreground md:hidden">Totale</label>
                <p className="font-mono text-foreground">€{(item.quantita * item.prezzo).toFixed(2)}</p>
            </div>

            {/* Delete Button */}
            <div className="col-span-2 md:col-span-1 flex justify-end items-start md:items-center order-2 md:order-5">
                <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 md:p-2 text-muted-foreground hover:text-destructive"
                    aria-label="Rimuovi articolo"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    ));

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold">Controlla gli articoli</h2>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                    Gemini ha estratto questi articoli. Correggili se necessario, poi continua per dividerli tra le persone.
                </p>
            </div>

            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                <div className="lg:col-span-2">
                    <div className="space-y-3">
                        {/* Header */}
                        <div className="hidden md:grid grid-cols-12 gap-x-3 items-center px-3 text-sm font-medium text-muted-foreground">
                            <div className="col-span-5">Prodotto</div>
                            <div className="col-span-2">Quantità</div>
                            <div className="col-span-2">Prezzo Unit.</div>
                            <div className="col-span-2 text-right">Totale</div>
                            <div className="col-span-1"></div>
                        </div>

                        {items.length > 0 ? itemRows : (
                            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                                <p className="text-muted-foreground">Nessun articolo. Aggiungine uno manualmente.</p>
                            </div>
                        )}
                    </div>
                     <div className="mt-6 border-t border-border pt-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-2">
                                <button onClick={handleAddItem} disabled={isAppending} className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-md hover:border-primary hover:text-primary text-sm justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                    <PlusIcon className="w-5 h-5" />
                                    <span>Aggiungi articolo</span>
                                </button>
                                {isAppending ? (
                                    <div className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-muted-foreground">
                                        <div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin"></div>
                                        <span>Aggiungendo...</span>
                                    </div>
                                ) : (
                                    <AppendReceiptUpload onFileUpload={onAppendReceipt} disabled={isAppending} />
                                )}
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-muted-foreground">Totale Scontrino</div>
                                <div className="text-2xl font-bold font-mono">€{total.toFixed(2)}</div>
                            </div>
                        </div>
                        {appendError && <p className="mt-2 text-sm text-destructive">{appendError}</p>}
                    </div>
                </div>

                <div className="lg:col-span-1 mt-8 lg:mt-0">
                    <div className="sticky top-24">
                        <h3 className="text-lg font-semibold mb-2">Scontrin{imageUrls.length > 1 ? 'i' : 'o'}</h3>
                        {imageUrls.length > 0 ? (
                            <div 
                                className="grid gap-2 p-2 bg-muted/50 rounded-lg"
                                style={{ gridTemplateColumns: `repeat(${Math.min(imageUrls.length, 3)}, 1fr)` }}
                            >
                                {imageUrls.map((url, index) => (
                                     <img 
                                        key={url}
                                        src={url} 
                                        alt={`Scontrino ${index + 1}`}
                                        className="w-full aspect-[3/4] object-cover rounded-md shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => setSelectedImageUrl(url)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg bg-muted w-full aspect-[4/3] flex items-center justify-center">
                                <p className="text-muted-foreground">Nessuna immagine</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center">
                 <button 
                    onClick={onNext}
                    disabled={items.length === 0}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-primary/30"
                >
                    Continua e Assegna Articoli
                </button>
            </div>
            
            {selectedImageUrl && (
                 <div 
                    className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center animate-fade-in"
                    onClick={() => setSelectedImageUrl(null)}
                 >
                    <img 
                        src={selectedImageUrl} 
                        alt="Scontrino a schermo intero"
                        className="max-w-[95vw] max-h-[95vh] object-contain"
                        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking on image
                    />
                 </div>
            )}
        </div>
    );
};

export default ItemEditor;