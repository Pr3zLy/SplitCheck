# SplitCheck

SplitCheck semplifica la divisione del conto. Carica una ricevuta e l'app estrarrà automaticamente gli articoli. Assegna gli articoli agli amici e ottieni la suddivisione finale in pochi secondi. Niente più calcoli manuali!

Creato da **Matteo Abrugiato**.

## Funzionalità

*   Carica l'immagine di una ricevuta.
*   Estrae automaticamente articoli, quantità e prezzo utilizzando l'IA di Gemini.
*   Assegna articoli a più persone.
*   Calcola l'importo totale per ogni persona.

## Tecnologie Utilizzate

*   React
*   TypeScript
*   Vite
*   Google Gemini AI

## Esecuzione in Locale

**Prerequisiti:** Node.js

1.  Clona il repository:
    ```bash
    git clone https://github.com/Pr3zLy/SplitCheck.git
    ```
2.  Installa le dipendenze:
    ```bash
    cd SplitCheck
    npm install
    ```
3.  Imposta la tua chiave API Gemini in un file `.env.local` nella root del progetto. Crea il file se non esiste.
    ```
    API_KEY=tua_chiave_api_gemini
    ```
4.  Avvia l'app:
    ```bash
    npm run dev
    ```