Brambley Notes content lives in this directory as Markdown or MDX files.

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

The three Notes categories are:

garden
science
chronicle

The filename becomes the public slug:

finding-brambley.md -> /blog/finding-brambley/

## Artwork inside an entry

Most entries can remain ordinary Markdown. When an entry needs artwork between
paragraphs, use MDX and the built-in JournalIllustration component:

<JournalIllustration
  src="/assets/notes/example.webp"
  alt="Description of the illustration"
  caption="Optional caption."
  width="wide"
/>

Use width="column" to keep an illustration inside the prose column.

The journal frame and parchment are independent of the post text. Changing wording,
dates, headings, links, or article length never requires regenerating the background.
