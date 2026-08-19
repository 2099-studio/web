# Envío de leads del chat

Al finalizar el chat se envían **dos emails**:

1. **Al cliente** — resumen automático con necesidad, proyecto y presupuesto.
2. **A hola@2099.studio** — mismo brief para que prepares la asesoría manual.

## Opción A — Google Apps Script (recomendado)

Envía ambos emails desde Gmail sin popup.

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

## Opción B — FormSubmit (sin Apps Script)

El sitio usa [FormSubmit](https://formsubmit.co) con envío clásico (iframe), que **sí** permite autorespuesta al cliente.

**Primera vez:** completá un chat de prueba y revisá la bandeja de `hola@2099.studio` (y spam). FormSubmit envía un mail de **activación**; hay que hacer clic en el enlace **una sola vez**. Después funciona automáticamente.

> FormSubmit **no** envía autorespuestas si se usa la API `/ajax` — por eso el sitio usa POST clásico en iframe.

## Opción C — Web3Forms (respaldo)

1. Creá una cuenta en [web3forms.com](https://web3forms.com) con `hola@2099.studio`.
2. Copiá el access key en `.env`:

```env
PUBLIC_WEB3FORMS_ACCESS_KEY=tu-access-key
```

Solo notifica al estudio (no envía email al cliente). Usalo como respaldo si FormSubmit falla.
