# 2099.studio — Figma sync (TokenEzy)

Importar el design system a Figma con **[TokenEzy](https://www.figma.com/community/plugin/1637158488359053287/tokenezy)** — gratis, 1 clic, modos Dark/Light desde `$themes`.

**Archivo para TokenEzy:** `tokens/tokens.legacy.json` (formato Tokens Studio legacy)

**Descarga directa:**

```
https://raw.githubusercontent.com/2099-studio/web/main/tokens/tokens.legacy.json
```

> **No uses `tokens.json` en TokenEzy** — ese archivo es formato DTCG (`$value`, `$type`) y el plugin mostrará *0 tokens*. Usa `tokens.legacy.json`.

**Archivo DTCG (Tokens Studio / código):** `tokens/tokens.json`

---

## Requisitos

| Herramienta | Costo | Notas |
|-------------|-------|-------|
| [Figma](https://figma.com) | Starter o Professional | Ver tabla abajo |
| [TokenEzy](https://www.figma.com/community/plugin/1637158488359053287/tokenezy) | Gratis | Plugin open source (MIT) |

### Qué obtienes según tu plan Figma

| Plan Figma | TokenEzy crea |
|------------|---------------|
| **Starter (Free)** | Text Styles + Effect Styles (sombras). **No** Variables nativas |
| **Professional+** | Variables + modos **Dark / Light** + Text/Effect Styles |

---

## Paso 1 — Archivo Figma

1. **New design file** → `2099.studio — Design System`
2. Páginas sugeridas:
   - `01 · Foundations`
   - `02 · Components`
   - `03 · Web — Desktop`

---

## Paso 2 — Instalar TokenEzy

1. [TokenEzy en Figma Community](https://www.figma.com/community/plugin/1637158488359053287/tokenezy)
2. **Save** a tu cuenta
3. Abrir tu archivo → **Plugins** → **TokenEzy**

---

## Paso 3 — Importar tokens (1 clic)

1. Abre TokenEzy en el archivo
2. **Arrastra** `tokens.legacy.json` al plugin  
   (o pega el contenido / selecciona el archivo)
3. Revisa el **pre-flight diff**:
   - `new` — tokens que se crearán
   - `update` — tokens que cambiarán
   - `skip` — sin cambios
4. Opcional: **Dry run** para simular sin tocar el archivo
5. Pulsa **Import**

TokenEzy lee automáticamente:

| En JSON | En Figma |
|---------|----------|
| `$themes` | Modos **Dark** y **Light** |
| `theme-dark` / `theme-light` → `color` | Variables de color por modo |
| `core` → `space`, `radius` | Collections Spacing, Radius |
| `theme-*` → `shadow` | Effect Styles |
| `core` → `font`, `motion` | Variables de tipografía / motion |

Collections típicas que genera: **Colors**, **Spacing**, **Radius**, **Typography**, **Effects**, **Motion**.

---

## Paso 4 — Verificar en Figma

Tras importar, abre **Local variables** (panel derecho o menú):

- [ ] Modo **Dark** activo → `bg` = `#080808`, `accent-orange` = `#FF5C1A`
- [ ] Cambiar a modo **Light** → `bg` = `#F5F4F0`, `accent-orange` = `#D94400`
- [ ] Spacing: `space-8` = 32px
- [ ] Radius: `radius-lg` = 16px
- [ ] Effect styles para `shadow-sm`, `shadow-md`, `shadow-lg`

---

## Paso 5 — Fuentes (manual)

TokenEzy importa **nombres** de fuente, pero debes tenerlas en Figma:

| Fuente | Uso | Enlace |
|--------|-----|--------|
| Clash Display | Display | [Fontshare](https://www.fontshare.com/fonts/clash-display) |
| Satoshi | Body | [Fontshare](https://www.fontshare.com/fonts/satoshi) |
| Space Mono | Mono | [Google Fonts](https://fonts.google.com/specimen/Space+Mono) |

Si falta una fuente, Figma sustituirá por Inter — instálalas antes de diseñar componentes.

Crear **Text Styles** manualmente y vincular color a variables `text-primary`, `text-secondary`:

| Style | Font | Size | Weight |
|-------|------|------|--------|
| Display / Hero | Clash Display | 72 | 700 |
| Display / H2 | Clash Display | 48 | 700 |
| Display / H3 | Clash Display | 32 | 700 |
| Body / MD | Satoshi | 16 | 400 |
| Body / LG | Satoshi | 20 | 400 |
| Label / SM | Satoshi | 13 | 500 |
| Mono / XS | Space Mono | 11 | 400 |

---

## Paso 6 — Re-importar tras cambios

TokenEzy es **idempotente**: mismo JSON = 0 cambios.

Cuando edites `tokens/tokens.json`:

```
Editas tokens.json
        ↓
npm run tokens:legacy
        ↓
TokenEzy → arrastra tokens/tokens.legacy.json
        ↓
Revisas diff → Import
        ↓
Variables/estilos actualizados en Figma
```

No hay sync GitHub automático (a diferencia de Tokens Studio). Descarga el JSON actualizado desde GitHub o usa el archivo local.

---

## Qué NO hace TokenEzy

- Componentes (Button, Card, Header) — créalos después y vincula variables
- Logo / assets — sube manualmente desde `public/assets/brand/`
- Captura del sitio web — ver sección opcional abajo
- Typography composites completos — primitivos sí; estilos compuestos mejor manual o ampliar JSON

---

## Estructura del JSON

```json
{
  "core": { "font", "space", "radius", "motion", "layout", "breakpoint" },
  "theme-dark": { "color", "shadow" },
  "theme-light": { "color", "shadow" },
  "$themes": [
    { "id": "dark", "name": "Dark", "selectedTokenSets": { "core": "enabled", "theme-dark": "enabled", "theme-light": "disabled" } },
    { "id": "light", "name": "Light", "selectedTokenSets": { "core": "enabled", "theme-dark": "disabled", "theme-light": "enabled" } }
  ]
}
```

---

## Alternativa: Tokens Studio

Si más adelante necesitas **sync GitHub** o export bidireccional avanzado:

- [Tokens Studio for Figma](https://www.figma.com/community/plugin/843461159747178978/tokens-studio-for-figma)
- Import JSON → Export to Figma (no uses Import Variables/Styles — eso es Figma → plugin)

Ver docs: [Export to Figma](https://docs.tokens.studio/figma/export)

---

## Captura web en Figma (opcional)

1. `npm run dev` → http://localhost:4321/
2. Captura con Figma MCP (`generate_figma_design`) como referencia visual
3. Diseña encima con variables de TokenEzy
4. Borra la captura cuando termines

---

## Checklist post-import

- [ ] TokenEzy import sin errores
- [ ] Modos Dark / Light en variables
- [ ] Colores semánticos (`bg`, `surface`, `accent-orange`, `accent-blue`)
- [ ] Spacing y radius
- [ ] Effect styles (shadows)
- [ ] Fuentes instaladas en Figma
- [ ] Text Styles creados
- [ ] Assets de marca subidos
- [ ] Componentes base vinculados a variables

---

## Enlaces

- [TokenEzy — Figma Community](https://www.figma.com/community/plugin/1637158488359053287/tokenezy)
- [JSON raw (descarga)](https://raw.githubusercontent.com/2099-studio/web/main/tokens/tokens.json)
- [Repo 2099-studio/web](https://github.com/2099-studio/web)
- `DESIGN.md` — reglas de marca y componentes

---

*Flujo principal: TokenEzy. Actualizar si cambia `tokens.json`.*
