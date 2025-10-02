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

    const imagePart = await fileToGenerativePart(imageFile);
    const textPart = { text: "Analizza questa immagine di uno scontrino. Estrai tutti gli articoli con la loro quantità e il prezzo unitario. Ignora sconti, totali, subtotali, o altre informazioni non pertinenti agli articoli. Restituisci i dati in formato JSON, seguendo lo schema fornito. Assicurati che il prezzo sia un numero." };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        // FIX: The `contents` field should be a single Content object for this use case, not an array containing one Content object.
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

    try {
        // FIX: Trim whitespace from the response text before parsing, as per best practices.
        const jsonStr = response.text.trim();
        const parsedResponse = JSON.parse(jsonStr);
        if (!Array.isArray(parsedResponse)) {
            throw new Error("La risposta dell'AI non è un array.");
        }
        // Add a unique ID to each item
        return parsedResponse.map((item: Omit<ReceiptItem, 'id'>) => ({ ...item, id: crypto.randomUUID() }));
    } catch (e) {
        console.error("Failed to parse Gemini response:", response.text, e);
        throw new Error("Non è stato possibile analizzare la risposta dell'AI. Controlla la console per i dettagli.");
    }
};
