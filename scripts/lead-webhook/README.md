# Envío de leads del chat

Cuando alguien completa el chat del hero, el Apps Script (`Code.gs`):

1. **Registra el lead** en la hoja de Google Sheets **"2099 Leads"** (fecha, nombre, email, necesidad, proyecto, presupuesto, idioma, estado).
2. **Te avisa** en el Gmail dueño del script, con la etiqueta **"Leads 2099"**. Responder ese mail le contesta directo al cliente.
3. **Le envía al cliente** un resumen con su consulta (responder va a `hola@2099.design`).
   Cuando Gmail tenga configurado "Enviar como" `hola@2099.design`, sale automáticamente desde esa dirección.

Si el Apps Script no está configurado o falla, el sitio usa FormSubmit como respaldo.

## Instalación (una sola vez)

Con la cuenta **2099.designstudio@gmail.com**:

1. Abrí [script.google.com](https://script.google.com) → **Nuevo proyecto** → nombralo `2099 Leads`.
2. Borrá el contenido de `Código.gs` y pegá todo `Code.gs` → **Guardar**.
3. Arriba, elegí la función **`setup`** → **Ejecutar** → aceptá los permisos
   (Google avisa "app no verificada": *Configuración avanzada → Ir a 2099 Leads*).
   En el registro aparece el link a la hoja **"2099 Leads"**.
4. **Implementar → Nueva implementación** → tipo **Aplicación web**:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
5. Copiá la **URL de la aplicación web** (termina en `/exec`).

## Conectarlo al sitio

- **Producción:** Cloudflare → Workers & Pages → `web` → Settings → Variables and Secrets →
  `PUBLIC_LEAD_WEBHOOK_URL` = la URL `/exec` → guardar y volver a desplegar.
- **Local:** en `.env`:

```env
PUBLIC_LEAD_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
```

## Actualizar el script

Después de editar `Code.gs`: **Implementar → Administrar implementaciones → ✏️ → Versión: Nueva → Implementar**.
Así la URL `/exec` no cambia.

## Respaldo: FormSubmit

Si el webhook falla, el sitio envía con [FormSubmit](https://formsubmit.co) a `hola@2099.design`.
La primera vez llega un mail de **activación**: hay que hacer clic una sola vez.
