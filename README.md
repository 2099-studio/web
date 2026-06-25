# 2099.studio — Web

Sitio marketing del estudio. Astro 7, design tokens, i18n ES/EN, GSAP + Lenis.

## Demo en vivo

**GitHub Pages:** https://2099-studio.github.io/web/

| Ruta | Idioma |
|------|--------|
| [/web/](https://2099-studio.github.io/web/) | Español |
| [/web/en/](https://2099-studio.github.io/web/en/) | English |

## Desarrollo local

Hay **dos modos**. No uses la misma URL para ambos:

| Comando | URL local | Cuándo usarlo |
|---------|-----------|---------------|
| `npm run dev` | http://localhost:4321/ | Desarrollo normal (recomendado) |
| `npm run dev:pages` | http://localhost:4321/web/ | Probar igual que GitHub Pages |
| `npm run preview:pages` | http://localhost:4321/web/ | Preview del build de producción |

```bash
npm install
npm run dev
```

Si abres `http://localhost:4321/` con `dev:pages` activo, verás una página en blanco — entra en `/web/`.

**Importante:** si antes corriste un build con `GITHUB_PAGES=true` en la terminal, cierra esa terminal o ejecuta:

```powershell
Remove-Item Env:GITHUB_PAGES -ErrorAction SilentlyContinue
```

## Build

```bash
npm run build          # producción para 2099.studio (base /)
npm run build:pages    # build para GitHub Pages (base /web/)
npm run preview        # preview del build local
```

## Deploy

El push a `main` dispara el workflow [Deploy to GitHub Pages](.github/workflows/deploy.yml).

## Estructura

- `tokens/tokens.json` — design tokens (DTCG) + themes dark/light
- `DESIGN.md` — fuente de verdad de marca
- `FIGMA.md` — importar y sincronizar tokens con Figma
- `src/i18n/` — contenido ES/EN
- `src/components/` — secciones del sitio
