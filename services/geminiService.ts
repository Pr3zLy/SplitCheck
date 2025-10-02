import { GoogleGenAI, Type } from "@google/genai";
import type { ReceiptItem } from '../types';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const extractItemsFromReceipt = async (imageFile: File): Promise<ReceiptItem[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let response; // Declared here to be available in the catch block for logging.

    try {
        const imagePart = await fileToGenerativePart(imageFile);
        const textPart = { text: "Analizza questa immagine di uno scontrino. Estrai tutti gli articoli con la loro quantità e il prezzo unitario. Ignora sconti, totali, subtotali, o altre informazioni non pertinenti agli articoli. Restituisci i dati in formato JSON, seguendo lo schema fornito. Assicurati che il prezzo sia un numero." };

        response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            prodotto: {
                                type: Type.STRING,
                                description: "Il nome dell'articolo o prodotto.",
                            },
                            quantita: {
                                type: Type.NUMBER,
                                description: "La quantità dell'articolo. Dovrebbe essere 1 se non specificato.",
                            },
                            prezzo: {
                                type: Type.NUMBER,
                                description: "Il prezzo unitario dell'articolo.",
                            },
                        },
                        required: ["prodotto", "quantita", "prezzo"],
                    },
                },
            },
        });

        const jsonStr = response.text.trim();
        const parsedResponse = JSON.parse(jsonStr);
        if (!Array.isArray(parsedResponse)) {
            throw new Error("La risposta dell'AI non è un array.");
        }
        
        return parsedResponse.map((item: Omit<ReceiptItem, 'id'>) => ({ ...item, id: crypto.randomUUID() }));

    } catch (e) {
        console.error("Errore durante la chiamata a Gemini o nel parsing della risposta:", e);
        if (response) {
            console.error("Testo della risposta di Gemini (in caso di errore di parsing):", response.text);
        }

        // Specific check for model overload error
        if (e instanceof Error && e.message.includes('503') && (e.message.includes('overloaded') || e.message.includes('UNAVAILABLE'))) {
             throw new Error("Il servizio è momentaneamente sovraccarico. Per favore, attendi qualche istante e riprova.");
        }
        
        // For all other errors (parsing, other API issues, etc.)
        throw new Error("Non è stato possibile analizzare lo scontrino. L'immagine potrebbe non essere chiara o il servizio potrebbe avere problemi. Riprova.");
    }
};