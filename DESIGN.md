# 2099.studio — DESIGN.md

**Versión:** 1.0  
**Fuente:** `2099studio_identidad_visual.md` v1.0  
**Tokens:** `tokens/tokens.json` (DTCG → Token Studio)  
**Proyecto:** Sitio web 2099.studio (caso de uso cero)

> Fuente de verdad para generación de código en Cursor.  
> Todas las variables CSS deben mapear a estos tokens.

---

## 01 · Marca

**2099.studio** — Estudio de diseño que une marca, producto y tecnología.  
**Ventaja:** Hacemos lo extremadamente complejo usable.  
**Metodología:** Discovery → Strategy → UX → UI → Execution.

### Logo

| Asset | Archivo | Uso |
|-------|---------|-----|
| Wordmark | `assets/brand/logo.png` | Nav, footer, documentación |
| Avatar `99` | `assets/brand/avatar.png` | Favicon, OG image, redes |

**Wordmark:** `2099` en Space Mono (bold) + `.studio` en Pixelity Sans (más pequeño). Símbolo zigzag en cuadrado debajo.

**Avatar:** Monograma `99` con notch pixel en esquina inferior izquierda — firma visual base del efecto Pixel Disintegration.

**Reglas:**
- No modificar proporciones del wordmark
- No usar fuentes del logo (Space Mono / Pixelity Sans) en titulares ni body
- Clearspace: 1× altura del símbolo `99` en todos los lados

---

## 02 · Color

### Filosofía

- **Dark mode** es el modo principal (`data-theme="dark"` por defecto)
- **Light mode** usa paleta propia — no es inversión de colores
- **Un acento por sección** — no mezclar naranja y azul en el mismo bloque
- **Orange** → acción, energía, CTAs, hero highlights
- **Blue** → técnico, sistema, tags, código
- **Highlight tipográfico:** una sola palabra clave por titular en `--color-accent-orange`

### Variables CSS

```css
/* ── DARK (default) ── */
:root,
[data-theme="dark"] {
  --color-bg: #080808;
  --color-surface: #111111;
  --color-elevated: #1E1E1E;
  --color-border: #2A2A2A;
  --color-text-primary: #F2F2F0;
  --color-text-secondary: #666663;
  --color-text-tertiary: #3A3A38;
  --color-accent-orange: #FF5C1A;
  --color-accent-orange-dark: #CC3A00;
  --color-accent-orange-glow: rgba(255, 92, 26, 0.15);
  --color-accent-blue: #2B5FFF;
  --color-accent-blue-dark: #1A3FCC;
  --color-accent-blue-glow: rgba(43, 95, 255, 0.15);
  --gradient-brand: linear-gradient(135deg, #FF5C1A 0%, #2B5FFF 100%);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.5);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.6);
  --shadow-lg: 0 8px 40px rgba(0, 0, 0, 0.8);
  --noise-opacity: 0.05;
}

/* ── LIGHT ── */
[data-theme="light"] {
  --color-bg: #F5F4F0;
  --color-surface: #FFFFFF;
  --color-elevated: #EDECE8;
  --color-border: #DDDBD5;
  --color-text-primary: #0A0A0A;
  --color-text-secondary: #6B6965;
  --color-text-tertiary: #B5B3AD;
  --color-accent-orange: #D94400;
  --color-accent-orange-dark: #B33600;
  --color-accent-orange-glow: rgba(217, 68, 0, 0.08);
  --color-accent-blue: #1A3FCC;
  --color-accent-blue-dark: #102B99;
  --color-accent-blue-glow: rgba(26, 63, 204, 0.08);
  --gradient-brand: linear-gradient(135deg, #D94400 0%, #1A3FCC 100%);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.10);
  --shadow-lg: 0 8px 40px rgba(0, 0, 0, 0.14);
  --noise-opacity: 0.03;
}
```

### Contraste WCAG

| Par | Ratio | Nivel |
|-----|-------|-------|
| Dark text-primary / bg | 19.5:1 | AAA |
| Dark orange / bg | 4.8:1 | AA |
| Dark blue / bg | 3.2:1 | AA (solo texto grande) |
| Light text-primary / bg | 18.9:1 | AAA |
| Light orange / bg | 5.1:1 | AA |
| Light blue / bg | 7.2:1 | AA |

---

## 03 · Tipografía

### Fuentes

| Rol | Familia | Fuente | Uso |
|-----|---------|--------|-----|
| Display | `--font-display` | Clash Display (Fontshare) | H1, H2, heroes |
| Body | `--font-body` | Satoshi (Fontshare) | Párrafos, nav, UI |
| Mono | `--font-mono` | Space Mono (Google Fonts) | Código, datos, labels técnicos |

**Carga recomendada:**

```html
<link href="https://api.fontshare.com/v2/css?f[]=clash-display@700&f[]=satoshi@400,500&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```

### Escala

| Token | Tamaño | Uso |
|-------|--------|-----|
| `--text-xs` | 11px | Captions |
| `--text-sm` | 13px | Nav, labels |
| `--text-md` | 16px | Body |
| `--text-lg` | 20px | Subtítulos |
| `--text-xl` | 32px | H3 |
| `--text-2xl` | 48px | H2 |
| `--text-3xl` | 72px | H1 |
| `--text-hero` | clamp(72px, 10vw, 120px) | Hero display |

### Reglas

- Clash Display Bold (700) en titulares — `letter-spacing: -0.02em` en tamaños grandes
- Satoshi Regular (400) body, Medium (500) labels y botones
- Highlight: una palabra en `--color-accent-orange`, sin subrayado
- Ejemplo: `Hacemos lo complejo <span class="highlight">usable</span>.`

---

## 04 · Espaciado, grid y layout

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
--space-16: 64px;
--space-24: 96px;
--space-32: 128px;

--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-full: 9999px;

--max-width: 1280px;
--gutter: 24px;
--margin: clamp(16px, 5vw, 80px);
--cols: 12;
```

### Breakpoints (mobile-first)

| Token | Valor |
|-------|-------|
| `--bp-sm` | 640px |
| `--bp-md` | 768px |
| `--bp-lg` | 1024px |
| `--bp-xl` | 1280px |

---

## 05 · Lenguaje gráfico

### 5.1 Pixel Disintegration (firma del estudio)

- El `99` se desintegra en píxeles hacia los bordes
- Centro sólido → dispersión decreciente en el perímetro
- Dark: naranja/azul sobre Void | Light: naranja/azul sobre Paper
- Uso: hero, section openers, case study covers
- Implementación: CSS grid + opacidad variable + GSAP en load

### 5.2 Pixel Grid Texture

- Grid 2–4px, opacidad 3–8%
- Naranja: secciones de acción | Azul: secciones técnicas
- Fondo sutil, nunca dominante

### 5.3 Noise / Grain

- Capa sobre el fondo, no como fondo
- Opacidad: `--noise-opacity` (dark 5%, light 3%)
- SVG `feTurbulence` o CSS backdrop

### 5.4 Formas geométricas

- Triángulos, flechas, rayos — gradiente `--gradient-brand`
- Off-canvas, parallax lento con scroll
- Conexión con zigzag del logo `99`

### 5.5 Juego tipográfico (solo hero / case studies)

- Clash Display con textura pixel interna en letras selectas
- Alternativa simple: texto acento sobre pixel grid
- No repetir en todo el sitio

---

## 06 · Motion

Referencia: **halaskastudio.com**

| Efecto | Duración | Easing | Trigger |
|--------|----------|--------|---------|
| Text reveal | 800ms | ease-out | intersection |
| Page transition | 600ms | ease-out | nav click |
| Card hover | 200ms | ease-out | mouseover |
| Cursor magnético | 100ms | ease-out | mousemove (desktop) |
| Pixel disintegration | 1200ms | ease-spring | page load |
| Parallax formas | continuo | linear | scroll |
| Fade secciones | 500ms | ease-out | intersection |
| Theme switch | 300ms | ease-out | toggle |

```css
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--dur-fast: 150ms;
--dur-base: 300ms;
--dur-slow: 600ms;
--dur-page: 900ms;
```

**Reglas:**
- Respetar `prefers-reduced-motion: reduce`
- Máximo 2 animaciones simultáneas en viewport
- Cursor personalizado activo en desktop
- Excluir `.pixel-grid`, `.animate-reveal`, `canvas` de transiciones globales de theme

---

## 07 · Theme switch

```js
const toggleTheme = () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('2099-theme', next);
};

const saved = localStorage.getItem('2099-theme');
const preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
document.documentElement.setAttribute('data-theme', saved || preferred);
```

**Posición:** Nav derecha, junto al logo. Ícono sol/luna o punto en color acento activo.

---

## 08 · Arquitectura del sitio

| # | Sección | ID sugerido | Visual principal | Acento |
|---|---------|-------------|------------------|--------|
| 01 | Hero / Header | `#hero` | Pixel disintegration `99` + headline | Orange |
| 02 | Servicios | `#services` | Cards con números + hover reveal | Blue |
| 03 | Industrias | `#industries` | 3 capas diferenciadas | Orange/Blue/Mix |
| 04 | Metodología | `#methodology` | Timeline scroll-driven | Blue |
| 05 | Works | `#works` | Grid hover reveal inmersivo | Alternado |
| 06 | Contacto | `#contact` | CTA grande + glow | Orange |

### Capas de industria (sección 03)

| Capa | Sectores | Tono visual |
|------|----------|-------------|
| Tradicional | Construcción, Real Estate, E-commerce, Retail | Orange |
| Tecnológica | SaaS, Fintech, CRM, ERP, Automation | Blue |
| Emergente | Web3, DeFi, DEX, AI/ML, Agentes | Mix (gradiente) |

---

## 09 · Componentes base

### Nav

- Fijo o sticky, fondo `--color-bg` con blur sutil
- Logo wordmark izquierda
- Links: Satoshi `--text-sm`, `--color-text-secondary` → hover `--color-text-primary`
- Theme toggle derecha
- Cursor magnético en links (desktop)

### Botón primario (CTA)

```css
.btn-primary {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: var(--text-sm);
  color: var(--color-bg);
  background: var(--color-accent-orange);
  border-radius: var(--radius-full);
  padding: var(--space-3) var(--space-6);
  transition: background var(--dur-fast) var(--ease-out);
}
.btn-primary:hover {
  background: var(--color-accent-orange-dark);
}
```

### Card

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  transition: border-color var(--dur-fast) var(--ease-out),
              background var(--dur-fast) var(--ease-out);
}
.card:hover {
  background: var(--color-elevated);
  border-color: var(--color-accent-blue);
}
```

### Highlight en titular

```css
.highlight {
  color: var(--color-accent-orange);
}
```

---

## 10 · Stack técnico (este proyecto)

| Capa | Tecnología |
|------|------------|
| Framework | Astro |
| Estilos | CSS custom properties (tokens de este doc) |
| Animación | GSAP + Lenis (smooth scroll) |
| Deploy | Vercel |
| Accesibilidad | WCAG AA mínimo |

---

## 11 · Calidad y accesibilidad

- HTML semántico (`header`, `main`, `section`, `nav`, `footer`)
- `aria-label` en botones icon-only (theme toggle)
- Foco visible en todos los interactivos
- `prefers-reduced-motion` desactiva animaciones no esenciales
- Imágenes: WebP/AVIF, `loading="lazy"`, dimensiones explícitas
- Core Web Vitals: LCP < 2.5s, CLS < 0.1

---

## 12 · Referencias activas

| Referencia | Qué tomamos |
|------------|-------------|
| halaskastudio.com | Motion, cursor magnético, case studies |
| arounda.agency | Estructura servicios, hover reveal works |
| pentestai.xyz | Space Mono visual, noise, colores eléctricos |
| linear.app | Densidad, micro-animaciones |
| vercel.com | Negro base, código como gráfico |
| Bolt 2025 Brand Book | Estructura documentación, highlight tipográfico |

---

## 13 · Token Studio — importación

Ver **`FIGMA.md`** para el flujo completo (import local, sync GitHub, themes, fuentes).

Resumen:

1. Abrir Figma → Plugins → **Tokens Studio**
2. Settings → **W3C DTCG format**
3. Import → JSON → `tokens/tokens.json`
4. Themes **Dark** / **Light** se cargan desde `$themes` en el JSON
5. Apply to document → vincular variables nativas de Figma

Sync continuo: Tokens Studio → GitHub → repo `2099-studio/web` → `tokens/tokens.json`

---

*Generado en F0 — Brand Book pendiente. Actualizar cuando existan secciones 00, 01, 02, 06, 07 en Figma.*
