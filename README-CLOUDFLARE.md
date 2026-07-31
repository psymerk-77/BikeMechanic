# BIKE MECHANIC — Cloudflare Pages

Questa versione è stata convertita dalla precedente architettura Node.js a
Cloudflare Pages + Pages Functions + Cloudflare D1.

Cloudflare Pages Functions permette di eseguire API server-side senza un server
dedicato; D1 fornisce il database SQL. Il piano gratuito attuale di Workers
include 100.000 richieste/giorno e D1 include 5 milioni di righe lette/giorno,
100.000 righe scritte/giorno e 5 GB di storage.

## Deploy

### 1. Crea il progetto Pages

Puoi collegare il repository GitHub a Cloudflare Pages.

Il progetto usa:
- output statico: `public`
- API: `functions/`
- database: D1

### 2. Crea D1

Esegui:

`npx wrangler d1 create bike-mechanic-db --jurisdiction eu`

Copia il `database_id` ottenuto in `wrangler.toml`.

### 3. Applica la migrazione

`npx wrangler d1 migrations apply bike-mechanic-db --remote`

### 4. Imposta le variabili segrete

Nel progetto Cloudflare aggiungi:
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID` (opzionale)
- `STRIPE_WEBHOOK_SECRET`
- `PRICE_CENTS` (es. 1990)

Le chiavi segrete non vanno inserite nel frontend.

### 5. Deploy

Con Wrangler:

`npx wrangler pages deploy public`

Per un progetto Pages con Functions, usa il workflow Git-based/documentato da
Cloudflare oppure il comando Pages compatibile con la tua configurazione.

## URL gratuito

Il progetto può essere pubblicato su un sottodominio `*.pages.dev`. Il nome
finale dipende dal nome del progetto disponibile nel tuo account Cloudflare.

Non posso garantire in anticipo che `bikemechanic.pages.dev` sia libero.

## Google Play / TWA

Dopo il deploy devi aggiornare il progetto Android con il sottodominio Pages
effettivamente assegnato.

Il file Digital Asset Links deve essere disponibile su:

`https://TUO-PROGETTO.pages.dev/.well-known/assetlinks.json`

La fingerprint SHA-256 deve corrispondere alla chiave di firma Android.

## Nota commerciale

Il piano gratuito è adatto a partire, ma non significa traffico commerciale
illimitato: le Pages Functions consumano la quota Workers Free. Gli asset
statici sono gratuiti; le funzioni hanno il limite giornaliero previsto dal
piano.

Per un'app venduta a molti utenti, monitora le quote prima del lancio.

## Sicurezza

- password con PBKDF2-SHA-256 lato server;
- sessioni memorizzate come hash in D1;
- cookie HttpOnly/Secure/SameSite;
- capitoli serviti dalle Functions solo a utenti PRO;
- webhook Stripe con verifica HMAC della firma;
- nessuna chiave Stripe nel browser.

## Importante

La configurazione è pronta, ma il deploy reale richiede il tuo account
Cloudflare e la creazione del database D1. Non posso creare quelle risorse nel
tuo account senza accesso/account collegato.
