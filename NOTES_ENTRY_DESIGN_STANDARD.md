# Brambley Notes — Individual Entry Design Standard

This document governs all individual Brambley Notes / journal entries.

## Core rule

Each entry should read as a clean page from its parent journal, not as a conventional blog template and not as a literal handwritten notebook page.

The page background and journal framing are artwork. All article text remains live HTML/Markdown/MDX so the writing can be edited without regenerating the artwork.

## Journal identity

Use one reusable full-screen journal-page background per Notes category:

- **Garden Book** — muted green journal identity
- **Science Field Notes** — dark blue journal identity
- **Chronicle** — brown journal identity

The article page should use warm aged paper with only restrained journal-color/binding cues at the edges. The writing is the visual focus.

## Typography and article header

Typography should match the style of the approved illustrated index spreads.

The article header is live text and may contain:

- publication date
- title
- optional subtitle
- a restrained rule or journal ornament

Use a traditional serif face and the same muted ink character as the index pages rather than hard black.

## Reading layout

- Full-screen page background.
- Centered prose column for comfortable reading.
- Desktop reading width should be approximately **700–780 px**.
- The page may extend vertically for long entries.
- Do not stretch prose across the full viewport.
- Maintain generous negative space.

## Navigation

Keep navigation restrained.

Provide:

- a link back to the appropriate journal index near the top
- a matching return link at the bottom

Avoid conventional blog chrome, sidebars, card grids, metadata panels, or unrelated navigation clutter.

## Editable content

Article prose must remain editable Markdown or MDX.

Changing the title, date, subtitle, headings, paragraphs, links, or other text must **not** require regenerating any page artwork.

Recommended frontmatter:

```yaml
title: "Post title"
date: 2026-10-03
category: chronicle
topic: "Brambley History"
subtitle: "Optional subtitle"
hero_art: "/assets/notes/example.webp" # optional
draft: false
```

## Optional artwork

Entries may occasionally include illustrations in the manner of the Brambley About page.

Artwork is always a separate image asset, never baked into the journal-page background.

MDX should support a reusable illustration component such as:

```mdx
<JournalIllustration
  src="/assets/notes/example.webp"
  alt="Descriptive alternative text"
  caption="Optional caption."
/>
```

Supported uses may include:

- centered illustration within the reading column
- illustration slightly wider than the prose column
- optional caption
- occasional hero illustration when appropriate

Artwork should remain restrained and consistent with the Brambley naturalist-folio standard. It should not be added merely to fill space.

## Responsive behavior

On narrow screens:

- preserve the journal-paper character
- reduce title size appropriately
- maintain comfortable text margins
- keep the prose as live text
- allow illustrations to scale fluidly
- preserve clear access to the journal index

## Prohibited treatments

Do not:

- render article text into the background artwork
- require a new generated background when prose changes
- imitate handwriting for body text
- introduce generic blog cards, sidebars, or magazine layouts
- replace approved journal styling with a new visual interpretation
- add decorative objects or illustrations without a specific editorial reason
- allow decorative treatment to reduce readability

## Governing principle

The landing page and illustrated indexes provide the theatrical journal experience. Individual entries provide quiet, comfortable reading inside that same journal world.
