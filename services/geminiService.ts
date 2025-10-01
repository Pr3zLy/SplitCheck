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
    if (!process.env.API_KEY) {
        console.error("Gemini API key is not configured in environment variables.");
        throw new Error("La chiave API per il servizio AI non è configurata. Contatta lo sviluppatore.");
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const imagePart = await fileToGenerativePart(imageFile);
    const textPart = { text: "Analizza questa immagine di uno scontrino. Estrai tutti gli articoli con la loro quantità e il prezzo unitario. Ignora sconti, totali, subtotali, o altre informazioni non pertinenti agli articoli. Restituisci i dati in formato JSON, seguendo lo schema fornito. Assicurati che il prezzo sia un numero." };
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            prodotto: { type: Type.STRING, description: "Il nome dell'articolo o prodotto." },
                            quantita: { type: Type.NUMBER, description: "La quantità dell'articolo. Dovrebbe essere 1 se non specificato." },
                            prezzo: { type: Type.NUMBER, description: "Il prezzo unitario dell'articolo." },
                        },
                        required: ["prodotto", "quantita", "prezzo"],
                    },
                },
            },
        });

        if (!response.candidates || response.candidates.length === 0) {
            console.error("Gemini response is invalid or empty. Response:", response);
            throw new Error("Il servizio AI non ha fornito una risposta valida. La foto potrebbe essere di bassa qualità o il servizio è temporaneamente non disponibile.");
        }
        
        const candidate = response.candidates[0];
        const finishReason = candidate.finishReason;

        // FIX: Removed invalid 'OK' value from finishReason check as it's not a valid FinishReason enum member.
        if (finishReason && finishReason !== 'STOP') {
            console.error(`Gemini request finished with reason: ${finishReason}`);
            let userMessage = "L'analisi dello scontrino non è andata a buon fine. ";
            if (finishReason === 'SAFETY') {
                userMessage += "Il contenuto dell'immagine viola le norme di sicurezza.";
            } else if (finishReason === 'MAX_TOKENS') {
                userMessage += "Lo scontrino è troppo lungo per essere analizzato.";
            } else {
                userMessage += `C'è stato un problema (${finishReason}).`;
            }
            throw new Error(userMessage);
        }

        const jsonStr = response.text?.trim();

        if (!jsonStr) {
            console.error("Gemini response text is empty. Response:", response);
            throw new Error("Il servizio AI ha restituito una risposta vuota. La foto potrebbe non essere chiara.");
        }

        const parsedResponse = JSON.parse(jsonStr);
        if (!Array.isArray(parsedResponse)) {
            throw new Error("La risposta dell'AI non è un elenco di articoli come atteso.");
        }

        return parsedResponse.map((item: Omit<ReceiptItem, 'id'>) => ({ ...item, id: crypto.randomUUID() }));

    } catch (error) {
        console.error("Error during Gemini API call or processing:", error);

        if (error instanceof Error) {
            if (error.message.includes('API key not valid') || error.message.includes('403')) {
                throw new Error("La chiave API per il servizio AI non è valida o è scaduta.");
            }
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                 throw new Error("Errore di rete. Controlla la tua connessione e riprova.");
            }
            throw error;
        }
        
        throw new Error("Si è verificato un errore sconosciuto durante l'analisi dello scontrino.");
    }
};
