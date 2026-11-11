# 2099.studio — Web

Sitio marketing del estudio. Astro 7, design tokens, i18n ES/EN, GSAP + Lenis.

## Sitio en vivo

**https://2099.design**

| Ruta | Idioma |
|------|--------|
| [/](https://2099.design/) | Español |
| [/en/](https://2099.design/en/) | English |

## Desarrollo local

```bash
npm install
npm run dev            # http://localhost:4321/
```

Copiá `.env.example` a `.env` y configurá `PUBLIC_LEAD_WEBHOOK_URL` con la URL del webhook de Google Apps Script para que el chat envíe emails al finalizar (ver `scripts/lead-webhook/Code.gs`).

## Build

```bash
npm run build          # producción (output en dist/)
npm run preview        # preview del build local
```

## Deploy

Cloudflare Pages (proyecto `web`) compila cada push a `main` con `npm run build` y publica `dist/` en https://2099.design. Las variables `NODE_VERSION`, `PUBLIC_LEAD_WEBHOOK_URL` y `PUBLIC_WEB3FORMS_ACCESS_KEY` se configuran en el proyecto de Cloudflare (Settings → Variables and Secrets).

## Estructura

- `tokens/tokens.json` — design tokens (DTCG) + themes dark/light
- `DESIGN.md` — fuente de verdad de marca
- `FIGMA.md` — importar y sincronizar tokens con Figma
- `src/i18n/` — contenido ES/EN
- `src/components/` — secciones del sitio
