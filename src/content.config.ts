import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    subtitle: z.string().optional(),
    excerpt: z.string().optional(),
    category: z.enum(['garden', 'science', 'chronicle']).optional(),
    topic: z.string().optional(),
    hero_art: z.string().optional(),
    hero_art_alt: z.string().optional(),
    hero_art_caption: z.string().optional(),
    draft: z.boolean().default(false)
  })
});

export const collections = { notes };
