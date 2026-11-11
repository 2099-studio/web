/**
 * 2099.studio — Lead webhook (Google Apps Script)
 *
 * Deploy as Web App:
 * 1. script.google.com → New project → paste this file
 * 2. Deploy → New deployment → Web app
 * 3. Execute as: Me · Who has access: Anyone
 * 4. Copy the URL into PUBLIC_LEAD_WEBHOOK_URL (.env / GitHub secret)
 *
 * Optional: si no configurás la URL, el sitio usa FormSubmit como respaldo.
 */

var STUDIO_EMAIL = 'hola@2099.design';

var CLIENT_COPY = {
  es: {
    subject: 'Tu consulta en 2099.studio — resumen',
    recapTitle: 'Resumen de lo que nos compartiste:',
    needLabel: 'Necesidad',
    projectLabel: 'Proyecto',
    budgetLabel: 'Presupuesto estimado',
    outro:
      'En breve te enviaremos nuestra asesoría y consultoría de marca gratuita con recomendaciones personalizadas para tu proyecto.',
    signOff: '— Equipo 2099.studio',
  },
  en: {
    subject: 'Your 2099.studio inquiry — summary',
    recapTitle: 'Summary of what you shared:',
    needLabel: 'Need',
    projectLabel: 'Project',
    budgetLabel: 'Estimated budget',
    outro:
      'You will shortly receive our free brand advisory and consultation with personalized recommendations for your project.',
    signOff: '— 2099.studio team',
  },
};

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    sendLeadEmails(payload);
    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function sendLeadEmails(data) {
  var locale = data.locale === 'en' ? 'en' : 'es';
  var copy = CLIENT_COPY[locale];
  var name = String(data.name || '').trim();
  var email = String(data.email || '').trim();
  var need = String(data.need || '').trim();
  var projectDetail = String(data.projectDetail || '').trim();
  var budget = String(data.budget || '').trim();
  var attachment = data.attachmentFileName ? String(data.attachmentFileName) : '';
  var studioInbox = String(data.studioEmail || STUDIO_EMAIL).trim() || STUDIO_EMAIL;
  var clientAutoresponse = String(data.clientAutoresponse || '').trim();

  if (!name || !email) {
    throw new Error('Missing name or email');
  }

  var internalSubject = '2099.studio brief — ' + budget;
  var internalBody =
    'Nuevo lead desde el chat del sitio\n\n' +
    'Nombre: ' +
    name +
    '\nEmail: ' +
    email +
    '\nNecesidad: ' +
    need +
    '\nProyecto: ' +
    projectDetail +
    '\nPresupuesto: ' +
    budget +
    '\nIdioma: ' +
    locale +
    '\nFecha: ' +
    new Date().toISOString() +
    (attachment ? '\nArchivo adjunto (metadata): ' + attachment : '');

  GmailApp.sendEmail(studioInbox, internalSubject, internalBody, {
    replyTo: email,
    name: '2099.studio Web',
  });

  var clientBody =
    clientAutoresponse ||
    buildClientBody(copy, name, need, projectDetail, budget);

  GmailApp.sendEmail(email, copy.subject, clientBody, {
    replyTo: studioInbox,
    name: '2099.studio',
  });
}

function buildClientBody(copy, name, need, projectDetail, budget) {
  var greeting = copy.subject.indexOf('Your') === 0 ? 'Hi ' : 'Hola ';

  return (
    greeting +
    name +
    ',\n\n' +
    (copy.subject.indexOf('Your') === 0 ? 'Thank you for reaching out.\n\n' : 'Gracias por contactarnos.\n\n') +
    copy.recapTitle +
    '\n\n• ' +
    copy.needLabel +
    ': ' +
    need +
    '\n• ' +
    copy.projectLabel +
    ': ' +
    projectDetail +
    '\n• ' +
    copy.budgetLabel +
    ': ' +
    budget +
    '\n\n' +
    copy.outro +
    '\n\n' +
    copy.signOff
  );
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
