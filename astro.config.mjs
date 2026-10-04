import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://brambley.info',
  output: 'static',
  trailingSlash: 'never',
  integrations: [mdx()],
});
