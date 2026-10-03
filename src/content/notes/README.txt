Brambley Notes content lives in this directory as Markdown or MDX files.

This migration intentionally does not reconstruct missing Squarespace post text from memory.
Existing post prose, dates, slugs, links, and images should be migrated only from verified source material.

Expected frontmatter:

---
title: "Post title"
date: 2026-09-03
subtitle: "Optional subtitle"
excerpt: "Optional article-page excerpt"
category: chronicle
topic: "Brambley History"
hero_art: "/assets/notes/example.webp"          # optional
hero_art_alt: "Description of the artwork"      # recommended when hero_art is used
hero_art_caption: "Optional caption."           # optional
draft: false
---

The three approved Notes categories are:

garden
science
chronicle

Topic labels remain editable and are used to group entries on each illustrated index spread.

Examples:

category: garden
topic: "Orchard"

category: science
topic: "Seismic Observations"

category: chronicle
topic: "Brambley History"

The filename becomes the public slug. For example:

finding-brambley.md -> /blog/finding-brambley/

## Artwork inside an entry

Ordinary entries may remain Markdown. When an entry needs artwork within the body,
use MDX and the built-in JournalIllustration component:

<JournalIllustration
  src="/assets/notes/example.webp"
  alt="Description of the illustration"
  caption="Optional caption."
  width="wide"
/>

Use width="column" to keep an illustration inside the prose column.

Article prose remains live text. The journal-page background and framing never need
to be regenerated when wording, headings, dates, or links change.

Preserve existing titles, publication dates, slugs, text, links, and images as closely
as the verified source permits. Visual redesign is handled separately from content migration.
