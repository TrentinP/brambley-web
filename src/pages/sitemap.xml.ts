import { getCollection } from 'astro:content';

export const prerender = true;

export async function GET({ site }) {
  const base = site ?? new URL('https://brambley.info');
  const notes = await getCollection('notes', ({ data }) => !data.draft);

  const paths = [
    '/',
    '/about',
    '/observatory',
    '/wxstation',
    '/weather-data-archive',
    '/seismic',
    '/quakearchive',
    '/blog',
    '/blog/garden',
    '/blog/science',
    '/blog/chronicle',
    ...notes.map((entry) => `/blog/${entry.id}`)
  ];

  const unique = [...new Set(paths)];

  const body = unique
    .map((path) => `  <url><loc>${new URL(path, base).href}</loc></url>`)
    .join('\n');

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    body +
    '\n</urlset>\n';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
}
