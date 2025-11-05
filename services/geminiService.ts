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

const serviceTranslations = {
  it: {
    prompt: "Analizza questa immagine di uno scontrino. Estrai tutti gli articoli con la loro quantità e il prezzo unitario. Ignora sconti, totali, subtotali, o altre informazioni non pertinenti agli articoli. Restituisci i dati in formato JSON, seguendo lo schema fornito. Assicurati che il prezzo sia un numero.",
    errorOverloaded: "Il servizio è momentaneamente sovraccarico. Per favore, attendi qualche istante e riprova.",
    errorGeneric: "Non è stato possibile analizzare lo scontrino. L'immagine potrebbe non essere chiara o il servizio potrebbe avere problemi. Riprova."
  },
  en: {
    prompt: "Analyze this receipt image. Extract all items with their quantity and unit price. Ignore discounts, totals, subtotals, or any other information not relevant to the items. Return the data in JSON format, following the provided schema. Ensure the price is a number.",
    errorOverloaded: "The service is temporarily overloaded. Please wait a moment and try again.",
    errorGeneric: "Could not analyze the receipt. The image may be unclear or the service may be having issues. Please try again."
  }
};

export const extractItemsFromReceipt = async (imageFile: File, lang: 'it' | 'en'): Promise<ReceiptItem[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    let response; // Declared here to be available in the catch block for logging.

    try {
        const imagePart = await fileToGenerativePart(imageFile);
        const textPart = { text: serviceTranslations[lang].prompt };

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
                                description: "The name of the item or product.",
                            },
                            quantita: {
                                type: Type.NUMBER,
                                description: "The quantity of the item. Should be 1 if not specified.",
                            },
                            prezzo: {
                                type: Type.NUMBER,
                                description: "The unit price of the item.",
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
            throw new Error("AI response is not an array.");
        }
        
        return parsedResponse.map((item: Omit<ReceiptItem, 'id'>) => ({ ...item, id: crypto.randomUUID() }));

    } catch (e) {
        console.error("Error calling Gemini or parsing response:", e);
        if (response) {
            console.error("Gemini response text (in case of parsing error):", response.text);
        }

        // Specific check for model overload error
        if (e instanceof Error && e.message.includes('503') && (e.message.includes('overloaded') || e.message.includes('UNAVAILABLE'))) {
             throw new Error(serviceTranslations[lang].errorOverloaded);
        }
        
        // For all other errors (parsing, other API issues, etc.)
        throw new Error(serviceTranslations[lang].errorGeneric);
    }
};
