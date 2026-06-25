# 2099.studio — Web

Sitio marketing del estudio. Astro 7, design tokens, i18n ES/EN, GSAP + Lenis.

## Demo en vivo

**GitHub Pages:** https://2099-studio.github.io/web/

| Ruta | Idioma |
|------|--------|
| [/web/](https://2099-studio.github.io/web/) | Español |
| [/web/en/](https://2099-studio.github.io/web/en/) | English |

## Desarrollo local

```bash
npm install
npm run dev
```

Abre http://localhost:4321

## Build

```bash
npm run build          # producción (base /, site 2099.studio)
$env:GITHUB_PAGES='true'; npm run build   # build local para GitHub Pages
npm run preview
```

## Deploy

El push a `main` dispara el workflow [Deploy to GitHub Pages](.github/workflows/deploy.yml).

## Estructura

- `tokens/tokens.json` — design tokens (DTCG)
- `DESIGN.md` — fuente de verdad de marca
- `src/i18n/` — contenido ES/EN
- `src/components/` — secciones del sitio
