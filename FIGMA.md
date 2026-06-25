# 2099.studio — Figma sync

Guía para importar el design system del código a Figma de forma **gratuita** y mantenerlo sincronizado.

**Archivos fuente**

| Archivo | Rol |
|---------|-----|
| `tokens/tokens.json` | Tokens DTCG + themes dark/light |
| `DESIGN.md` | Marca, componentes, motion, reglas |
| `src/styles/tokens.css` | Variables CSS en producción |

**Repo:** https://github.com/2099-studio/web

---

## Requisitos

| Herramienta | Costo | Para qué |
|-------------|-------|----------|
| [Figma](https://figma.com) | Gratis (Starter) o Pro | Archivo de diseño |
| [Tokens Studio](https://www.figma.com/community/plugin/843461159747178978/tokens-studio-for-figma) | Gratis | Importar JSON + themes |
| [TokenEzy](https://www.figma.com/community/plugin/1637158488359053287/tokenezy) | Gratis (opcional) | Import 1-clic a Variables |

**Nota:** Figma **Starter** no incluye Variables nativas. Con plan gratuito, Tokens Studio guarda tokens en el plugin y puede crear **Color / Text / Effect Styles**. Para **Variables con modos** Dark/Light nativos necesitas Figma **Professional+** o TokenEzy en un plan con Variables.

---

## Paso 1 — Crear archivo Figma

1. Figma → **New design file**
2. Nombre: `2099.studio — Design System`
3. Crear páginas sugeridas:
   - `00 · Cover`
   - `01 · Foundations` (colores, tipo, spacing)
   - `02 · Components`
   - `03 · Web — Desktop`
   - `04 · Web — Mobile`

---

## Paso 2 — Instalar Tokens Studio

1. Community → buscar **Tokens Studio for Figma**
2. **Save** al cuenta
3. Abrir el archivo → Plugins → **Tokens Studio for Figma**

---

## Paso 3 — Importar tokens (primera vez)

### Opción A — Desde archivo local

1. En el plugin → **New token project**
2. **Settings** (engranaje) → **Token format** → **W3C DTCG format**
3. Menú → **Import** → **Import JSON**
4. Seleccionar `tokens/tokens.json` del repo
5. Verificar que aparecen 3 sets:
   - `core`
   - `theme-dark`
   - `theme-light`
6. Verificar **2 themes** en la pestaña Themes:
   - **Dark** → `core` + `theme-dark`
   - **Light** → `core` + `theme-light`

> Los themes vienen definidos en `$themes` al final del JSON — no hace falta configurarlos a mano.

### Opción B — Desde GitHub (sync automático)

1. Plugin → **Sync** → **GitHub**
2. Conectar cuenta y repo `2099-studio/web`
3. Ruta del archivo: `tokens/tokens.json`
4. Branch: `main`
5. **Pull** para importar

URL directa del JSON en GitHub:

```
https://github.com/2099-studio/web/blob/main/tokens/tokens.json
```

---

## Paso 4 — Aplicar tokens al documento

1. En Tokens Studio → pestaña **Themes** → seleccionar **Dark**
2. **Apply to document** (o **Create styles** según versión del plugin)
3. Repetir con theme **Light** si tu plan Figma soporta modos

**Qué se crea automáticamente**

| Token group | Resultado en Figma |
|-------------|-------------------|
| `theme-*/color/*` | Color variables / styles |
| `core/space/*` | Spacing variables |
| `core/radius/*` | Radius variables |
| `theme-*/shadow/*` | Effect styles |
| `core/motion/*` | Duration / easing (parcial) |
| `core/font/*` | Referencias de tipografía (sin instalar fuentes) |

**Qué NO es automático**

- Instalar fuentes (Clash Display, Satoshi, Space Mono)
- Text Styles compuestos (Display H1, Body, Mono label)
- Componentes (Button, Card, Header)
- Logo y assets de `public/assets/brand/`

---

## Paso 5 — Fuentes en Figma

Instalar o activar en el archivo:

| Fuente | Uso | Fuente |
|--------|-----|--------|
| Clash Display | Display | [Fontshare](https://www.fontshare.com/fonts/clash-display) |
| Satoshi | Body | [Fontshare](https://www.fontshare.com/fonts/satoshi) |
| Space Mono | Mono | [Google Fonts](https://fonts.google.com/specimen/Space+Mono) |

Luego crear **Text Styles** manualmente:

| Style name | Font | Size | Weight |
|------------|------|------|--------|
| Display / Hero | Clash Display | 72–120 | 700 |
| Display / H2 | Clash Display | 48 | 700 |
| Display / H3 | Clash Display | 32 | 700 |
| Body / MD | Satoshi | 16 | 400 |
| Body / LG | Satoshi | 20 | 400 |
| Label / SM | Satoshi | 13 | 500 |
| Mono / XS | Space Mono | 11 | 400 |
| Mono / SM | Space Mono | 13 | 400 |

Vincular colores de texto a variables: `text-primary`, `text-secondary`, `accent-orange`.

---

## Paso 6 — Alternativa rápida: TokenEzy

Si tienes Figma **Professional+**:

1. Plugins → **TokenEzy**
2. Arrastrar `tokens/tokens.json`
3. Revisar diff → **Import**
4. Crea collections + modos Dark/Light en un clic

En Figma Free, TokenEzy crea Text & Effect Styles pero no Variables.

---

## Mantener sincronizado (workflow)

```
Editas tokens/tokens.json o DESIGN.md en código
        ↓
git commit + push a main
        ↓
Tokens Studio → GitHub sync → Pull
        ↓
Apply to document (si hubo cambios)
        ↓
Actualizar componentes Figma si cambió semántica
        ↓
Export mental / manual → actualizar src/styles/tokens.css si aplica
```

**Regla:** `tokens.json` es la fuente para Figma. `tokens.css` debe reflejar los mismos valores (hoy se mantienen en paralelo; un futuro script puede generar CSS desde JSON).

---

## Estructura del JSON

```json
{
  "core": { "font", "space", "radius", "motion", "layout", "breakpoint" },
  "theme-dark": { "color", "shadow" },
  "theme-light": { "color", "shadow" },
  "$themes": [
    { "id": "dark", "selectedTokenSets": { "core": "enabled", "theme-dark": "enabled", ... } },
    { "id": "light", "selectedTokenSets": { "core": "enabled", "theme-light": "enabled", ... } }
  ]
}
```

---

## Capturar el sitio web en Figma (opcional)

Para tener la home actual como referencia visual:

1. `npm run dev` → http://localhost:4321/
2. En Cursor con plugin Figma: captura con `generate_figma_design` al mismo `fileKey`
3. Usar la captura solo como guía; reconstruir con componentes + tokens encima
4. Borrar captura cuando el diseño editable esté listo

Ver `DESIGN.md` §05 Lenguaje gráfico y conversación de `figma-generate-design`.

---

## Checklist post-import

- [ ] Themes Dark y Light visibles en Tokens Studio
- [ ] Colores `bg`, `surface`, `accent-orange`, `accent-blue` aplicados
- [ ] Spacing y radius importados
- [ ] Fuentes instaladas en Figma
- [ ] Text Styles creados y vinculados a variables
- [ ] Assets de marca subidos (`logo-white`, `logo-dark`, `avatar`, wordmark)
- [ ] Componentes base: Button, Card, Tag, Header
- [ ] Home desktop dark + light en página `03 · Web`

---

## Enlaces útiles

- [Tokens Studio docs — DTCG format](https://docs.tokens.studio/manage-settings/token-format)
- [Tokens Studio — Install plugin](https://docs.tokens.studio/get-started/install-figma-plugin)
- [TokenEzy (Figma Community)](https://www.figma.com/community/plugin/1637158488359053287/tokenezy)
- [Styleframe — DTCG sync](https://www.styleframe.dev/figma)
- [2099.studio brand assets en repo](/public/assets/brand/)

---

*Actualizar este doc cuando cambie la estructura de `tokens.json` o el flujo de sync.*
