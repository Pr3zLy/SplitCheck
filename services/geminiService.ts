import { GoogleGenAI, Type } from "@google/genai";
import type { ReceiptItem } from '../types';

// --- Anti-Spam & Rate Limiting ---
const MAX_REQUESTS_PER_SESSION = 5;
const MIN_INTERVAL_MS = 30 * 1000;
const BAN_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const STRIKE_LIMIT = 3;

const rateLimitTranslations = {
    it: {
        banned: (timeLeft: number) => `Sei stato temporaneamente bloccato per troppe richieste. Riprova tra ${timeLeft} minuti.`,
        sessionLimit: 'Hai raggiunto il numero massimo di 5 richieste per questa sessione.',
        spamBan: 'Rilevato spam. Sei stato bloccato per 5 minuti.',
        tooFast: (timeLeft: number) => `Attendi ${timeLeft} secondi prima di fare un'altra richiesta.`
    },
    en: {
        banned: (timeLeft: number) => `You have been temporarily banned for too many requests. Please try again in ${timeLeft} minutes.`,
        sessionLimit: 'You have reached the maximum of 5 requests for this session.',
        spamBan: 'Spam detected. You have been banned for 5 minutes.',
        tooFast: (timeLeft: number) => `Please wait ${timeLeft} seconds before making another request.`
    }
};

const enforceRateLimit = (lang: 'it' | 'en') => {
    const t = rateLimitTranslations[lang];
    const now = Date.now();

    const get = (key: string) => parseInt(sessionStorage.getItem(key) || '0', 10);
    const set = (key: string, value: number) => sessionStorage.setItem(key, value.toString());

    let count = get('splitcheck_request_count');
    const lastTime = get('splitcheck_last_request_time');
    let strikes = get('splitcheck_strikes');
    const bannedUntil = get('splitcheck_banned_until');

    // 1. Check if banned
    if (bannedUntil > now) {
        const timeLeft = Math.ceil((bannedUntil - now) / 1000 / 60);
        throw new Error(t.banned(timeLeft));
    }

    // 2. Check session request limit
    if (count >= MAX_REQUESTS_PER_SESSION) {
        throw new Error(t.sessionLimit);
    }

    // 3. Check time between requests (ignore for the very first request)
    if (lastTime !== 0 && now - lastTime < MIN_INTERVAL_MS) {
        strikes++;
        set('splitcheck_strikes', strikes);

        // Ban if too many strikes
        if (strikes >= STRIKE_LIMIT) {
            const newBannedUntil = now + BAN_DURATION_MS;
            set('splitcheck_banned_until', newBannedUntil);
            throw new Error(t.spamBan);
        }
        
        // Warn user to slow down
        const timeLeft = Math.ceil((MIN_INTERVAL_MS - (now - lastTime)) / 1000);
        throw new Error(t.tooFast(timeLeft));
    }
    
    // 4. If all checks pass, record the request attempt
    count++;
    set('splitcheck_request_count', count);
    set('splitcheck_last_request_time', now);
    set('splitcheck_strikes', 0); // Reset strikes on a valid request
};
// --- End Anti-Spam & Rate Limiting ---


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
    enforceRateLimit(lang);

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
