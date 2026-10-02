# Brambley migration status

## Phase 1 — scaffold and isolation

- [x] Astro static-site scaffold created.
- [x] Existing production Squarespace site left untouched.
- [x] Current working Observatory landing page moved into a normal Astro route.
- [x] Squarespace-only shell/reset CSS removed from the Astro Observatory page.
- [x] Existing route names reserved: `/home`, `/about`, `/observatory`, `/wxstation`, `/weather-data-archive`, `/seismic`, `/quakearchive`, `/blog`.
- [x] Current external data repositories remain the source of truth.
- [x] Homepage and About layouts are scaffolded without substituting unapproved artwork.

## Required before visual parity

- [ ] Import the exact current Homepage folio artwork.
- [ ] Import the exact current About folio artwork.
- [ ] Confirm the final accessible About transcript to accompany the artwork.

## Phase 2 — data pages

- [ ] Convert `TrentinP/brambley-weather/web/weather-station.html` to the Astro `/wxstation` route.
- [ ] Convert `TrentinP/brambley-weather/web/weather-archive.html` to `/weather-data-archive`.
- [ ] Convert the current Seismic page and recent-capture code to `/seismic`.
- [ ] Convert the earthquake archive to `/quakearchive`.
- [ ] Preserve the existing weather and seismic GitHub workflows; do not duplicate those pipelines inside the website repository.

## Phase 3 — Notes and launch

- [ ] Migrate Notes/blog content.
- [ ] Cross-browser and mobile review.
- [ ] Create Cloudflare Workers static-assets preview deployment.
- [ ] Only after parity is confirmed, point the Brambley domain at Cloudflare.