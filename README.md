# Brambley Web — Astro migration

This repository is the parallel Astro build of Brambley. The current Squarespace site should remain in place until this copy reaches visual and functional parity.

## Local development

Requires Node 22.

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Astro writes the static site to `dist/`.

## Cloudflare preview deployment

This project is intentionally a fully pre-rendered Astro site. Cloudflare Workers serves the generated `dist/` directory as static assets, so no Astro Cloudflare adapter or Worker runtime code is required at this stage.

The repository includes `wrangler.jsonc` for the static deployment. After the Cloudflare Git connection is created, keep the Brambley production domain on Squarespace until the preview site has been checked page by page.

Manual deployment, if needed:

```bash
npm run deploy
```

## Existing data sources

The website repository consumes, rather than replaces, the existing data pipelines:

- Weather: `TrentinP/brambley-weather`
- Seismic: `TrentinP/brambley-seismic`
- Live weather endpoint: `https://brambley-live-weather.trentin.workers.dev/current`

Those repositories remain the source of truth for collected observations and generated archives.

## Artwork still required

The two SVGs under `public/assets/home/` and `public/assets/about/` are intentionally plain migration placeholders. They are **not** proposed replacements for the approved Brambley artwork.

Before launch, replace them with the exact current exported artwork and update the corresponding image paths if the file type changes.

The Observatory still references its current Squarespace-hosted photographs during the first preview pass. Those images must also be copied into this repository before the Squarespace account is retired.

## Why the Observatory is already migrated

The current working Observatory code was recovered from the self-contained version that solved the Squarespace CSS collision. In Astro, its Squarespace-specific wrapper reset is no longer needed, so only the Observatory's own styles are retained.