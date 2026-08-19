# Envío de leads del chat

Al finalizar el chat se envían **dos emails**:

1. **Al cliente** — resumen automático con necesidad, proyecto y presupuesto.
2. **A hola@2099.studio** — mismo brief para que prepares la asesoría manual.

## Opción A — FormSubmit (sin configuración extra)

El sitio usa [FormSubmit](https://formsubmit.co) por defecto hacia `hola@2099.studio`.

**Primera vez:** completá un chat de prueba y revisá la bandeja de `hola@2099.studio`. FormSubmit envía un mail de **activación**; hay que hacer clic en el enlace **una sola vez**. Después, el envío automático funciona sin popup.

## Opción B — Google Apps Script (recomendado con Gmail)

1. Abrí [script.google.com](https://script.google.com) con la cuenta de `hola@2099.studio`.
2. Proyecto nuevo → pegá `Code.gs`.
3. **Implementar → Nueva implementación → Aplicación web**
   - Ejecutar como: **Yo**
   - Acceso: **Cualquier persona**
4. Copiá la URL `/exec` en `.env`:

```env
PUBLIC_LEAD_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
```

5. Reiniciá el dev server (`npm run dev`).
6. En GitHub → **Settings → Secrets → Actions** → `PUBLIC_LEAD_WEBHOOK_URL` para producción.

Si la URL está configurada, el sitio usa Apps Script; si falla, vuelve a FormSubmit.
