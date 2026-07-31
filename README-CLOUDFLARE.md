# BIKE MECHANIC — Cloudflare Pages (corretto)

Questa versione è pensata per **Cloudflare Pages**, non per "Create a Worker".

## Impostazioni Pages
- Framework preset: None
- Build command: lascia vuoto (oppure `exit 0`)
- Build output directory: `public`
- Root directory: `/`
- Production branch: `main`

## D1
Per il primo deploy D1 NON è inserito nel wrangler.toml. Dopo il primo deploy:
Workers & Pages → BikeMechanic → Settings → Bindings → Add → D1 database bindings.

Nome variabile obbligatorio: `DB`.

Poi crea il database D1 e applica `migrations/0001_initial.sql`.

## Importante
Non usare la schermata **Create a Worker**. Devi entrare in:
Workers & Pages → Create application → Pages → Connect to Git.

Il deploy Pages assegnerà un sottodominio gratuito `*.pages.dev`.
