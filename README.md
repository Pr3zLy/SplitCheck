<div align="center">
  <img src="https://i.imgur.com/58P64X0.png" alt="SplitCheck Logo" width="120" />
  <h1 align="center">SplitCheck</h1>
  <p align="center">
    Scansiona, dividi, risolto.
    <br />
    <a href="https://splitcheck.vercel.app/"><strong>Visita il sito »</strong></a>
  </p>
</div>

---

### Indice

- [Informazioni sul progetto](#informazioni-sul-progetto)
- [Funzionalità](#funzionalità)
- [Come utilizzarlo](#come-utilizzarlo)
- [Installazione locale](#installazione-locale)
- [Tecnologie utilizzate](#tecnologie-utilizzate)

---

## Informazioni sul progetto

SplitCheck è un'applicazione web progettata per semplificare la divisione delle spese. Che tu sia fuori a cena con amici o a fare la spesa in gruppo, SplitCheck ti permette di dividere il conto in modo rapido e preciso.

L'app offre due modalità principali:
1.  **Scansione AI**: Scatta una foto allo scontrino e lascia che l'intelligenza artificiale di Gemini estragga gli articoli e i prezzi per te.
2.  **Inserimento Manuale**: Se preferisci, puoi inserire manualmente ogni articolo e il relativo costo.

Una volta inseriti gli articoli, puoi assegnare ogni spesa a una o più persone e visualizzare un riepilogo dettagliato di chi deve cosa.

## Funzionalità

- **Scansione Scontrini con AI**: Utilizza il modello Gemini per analizzare l'immagine di uno scontrino ed estrarre automaticamente gli articoli.
- **Inserimento Manuale**: Aggiungi persone e articoli manualmente con un'interfaccia semplice e intuitiva.
- **Assegnazione Spese**: Assegna ogni articolo a una o più persone. È anche possibile dividere un articolo tra tutti i partecipanti con un solo click.
- **Assegnazione Casuale**: Non sai a chi assegnare un articolo? Usa la funzione di assegnazione casuale per sceglierlo in modo divertente.
- **Riepilogo Dettagliato**: Visualizza un sommario chiaro con il totale che ogni persona deve pagare.
- **Tema Scuro/Chiaro**: Cambia tema per adattarsi alle tue preferenze visive.
- **Privacy-focused**: Le immagini caricate vengono elaborate all'istante e non vengono mai salvate sui nostri server.

## Come utilizzarlo

1.  **Visita il sito**: Apri [SplitCheck](https://splitcheck.vercel.app/).
2.  **Scegli una modalità**:
    - Clicca su **Carica Scontrino** per utilizzare la fotocamera o caricare un'immagine. L'AI analizzerà lo scontrino e ti mostrerà gli articoli.
    - Clicca su **Inserisci Articoli Manualmente** per iniziare ad aggiungere le persone e poi gli articoli.
3.  **Modifica (se necessario)**: Nella schermata di modifica, puoi correggere i nomi, le quantità e i prezzi degli articoli estratti o aggiungerne di nuovi.
4.  **Assegna le spese**: Aggiungi le persone che partecipano alla spesa e assegna ogni articolo a chi l'ha consumato.
5.  **Visualizza il riepilogo**: Controlla il riepilogo finale per vedere quanto ogni persona deve pagare.

## Installazione locale

Per eseguire l'applicazione in locale, segui questi passaggi:

**Prerequisiti:**
- [Node.js](https://nodejs.org/) installato.
- Un API key di [Google AI Studio](https://ai.google.dev/).

**Installazione:**

1.  Clona il repository:
    ```sh
    git clone https://github.com/Pr3zLy/SplitCheck.git
    ```
2.  Entra nella cartella del progetto:
    ```sh
    cd SplitCheck
    ```
3.  Installa le dipendenze:
    ```sh
    npm install
    ```
4.  Crea un file `.env` nella root del progetto e aggiungi la tua API key di Gemini:
    ```
    VITE_GEMINI_API_KEY=LA_TUA_API_KEY
    ```
5.  Avvia l'applicazione:
    ```sh
    npm run dev
    ```
L'app sarà disponibile all'indirizzo `http://localhost:5173`.

## Tecnologie utilizzate

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google Gemini](https://ai.google.dev/)