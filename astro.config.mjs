// @ts-check
import { defineConfig } from 'astro/config';

const isGitHubPages = process.env.GITHUB_PAGES === 'true';

// https://astro.build/config
export default defineConfig({
  site: isGitHubPages ? 'https://2099-studio.github.io' : 'https://2099.studio',
  base: isGitHubPages ? '/web/' : '/',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
