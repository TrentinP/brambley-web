export const prerender = true;

export function GET({ site }) {
  const base = site ?? new URL('https://brambley.info');
  const sitemap = new URL('/sitemap.xml', base);

  return new Response(
    `User-agent: *\nAllow: /\nSitemap: ${sitemap.href}\n`,
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    }
  );
}
