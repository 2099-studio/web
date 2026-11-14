/**
 * 2099.studio — Lead webhook (Google Apps Script)
 *
 * Each lead from the hero chat:
 *   1. Sends the client a summary email (reply-to hola@2099.design)
 *   2. Notifies the studio inbox (the Google account that owns this script),
 *      labelled "Leads 2099" in Gmail
 *   3. Appends a row to the "2099 Leads" Google Sheet (created on first run)
 *
 * Deploy (see README.md):
 *   script.google.com → paste this file → run `setup` once → Deploy → Web app
 *   Execute as: Me · Who has access: Anyone → copy the /exec URL into
 *   PUBLIC_LEAD_WEBHOOK_URL (Cloudflare Pages env var + local .env)
 */

var STUDIO_EMAIL = 'hola@2099.design';
var SHEET_NAME = '2099 Leads';
var GMAIL_LABEL = 'Leads 2099';
var HEADERS = ['Fecha', 'Nombre', 'Email', 'Necesidad', 'Proyecto', 'Presupuesto', 'Idioma', 'Adjunto', 'Estado'];

var CLIENT_COPY = {
  es: {
    subject: 'Recibimos tu consulta — 2099.studio',
    hello: 'Hola',
    thanks: 'Gracias por contactarnos. Este es el resumen de lo que nos compartiste:',
    needLabel: 'Necesidad',
    projectLabel: 'Proyecto',
    budgetLabel: 'Presupuesto estimado',
    outro:
      'En breve te enviaremos nuestra asesoría y consultoría de marca gratuita con recomendaciones personalizadas para tu proyecto.',
    reply: 'Si querés sumar algo, respondé este mail.',
    signOff: 'Equipo 2099.studio',
  },
  en: {
    subject: 'We received your inquiry — 2099.studio',
    hello: 'Hi',
    thanks: 'Thank you for reaching out. Here is a summary of what you shared:',
    needLabel: 'Need',
    projectLabel: 'Project',
    budgetLabel: 'Estimated budget',
    outro:
      'You will shortly receive our free brand advisory and consultation with personalized recommendations for your project.',
    reply: 'If you want to add anything, just reply to this email.',
    signOff: '2099.studio team',
  },
};

/** Run once from the editor to grant permissions and create the sheet + label. */
function setup() {
  var sheet = getLeadsSheet();
  getOrCreateLabel();
  Logger.log('Hoja de leads: ' + sheet.getParent().getUrl());
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var payload = JSON.parse(e.postData.contents);
    handleLead(payload);
    return jsonResponse({ ok: true });
  } catch (err) {
    console.error(err);
    return jsonResponse({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function handleLead(data) {
  var lead = {
    locale: data.locale === 'en' ? 'en' : 'es',
    name: clean(data.name, 120),
    email: clean(data.email, 200),
    need: clean(data.need, 300),
    projectDetail: clean(data.projectDetail, 5000),
    budget: clean(data.budget, 120),
    attachment: clean(data.attachmentFileName, 200),
  };

  if (!lead.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    throw new Error('Missing name or valid email');
  }

  // 1) Record first, so the lead is never lost even if mail quota runs out
  getLeadsSheet().appendRow([
    new Date(),
    lead.name,
    lead.email,
    lead.need,
    lead.projectDetail,
    lead.budget,
    lead.locale,
    lead.attachment,
    'Nuevo',
  ]);

  // 2) Notify the studio (script owner's inbox — avoids the forward loop through hola@)
  notifyStudio(lead);

  // 3) Confirmation to the client
  sendClientEmail(lead);
}

function notifyStudio(lead) {
  var owner = Session.getEffectiveUser().getEmail();
  var subject = 'Nuevo lead: ' + lead.name + ' — ' + (lead.budget || 'sin presupuesto');
  var rows = [
    ['Nombre', lead.name],
    ['Email', lead.email],
    ['Necesidad', lead.need],
    ['Proyecto', lead.projectDetail],
    ['Presupuesto', lead.budget],
    ['Idioma', lead.locale],
  ];
  if (lead.attachment) rows.push(['Adjunto (solo nombre)', lead.attachment]);

  var text = 'Nuevo lead desde el chat de 2099.design\n\n' +
    rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n') +
    '\n\nRespondé este mail para contestarle directamente.';

  var html = wrapHtml(
    '<h1 style="margin:0 0 16px;font-size:20px;">Nuevo lead desde 2099.design</h1>' +
    detailsTable(rows) +
    '<p style="margin:24px 0 0;color:#666;font-size:13px;">Respondé este mail para contestarle directamente.</p>'
  );

  GmailApp.sendEmail(owner, subject, text, {
    htmlBody: html,
    replyTo: lead.email,
    name: '2099.studio Web',
  });

  labelLatestThread(subject);
}

function sendClientEmail(lead) {
  var copy = CLIENT_COPY[lead.locale];
  var rows = [
    [copy.needLabel, lead.need],
    [copy.projectLabel, lead.projectDetail],
    [copy.budgetLabel, lead.budget],
  ];

  var text =
    copy.hello + ' ' + lead.name + ',\n\n' +
    copy.thanks + '\n\n' +
    rows.map(function (r) { return '• ' + r[0] + ': ' + r[1]; }).join('\n') +
    '\n\n' + copy.outro + '\n\n' + copy.reply + '\n\n— ' + copy.signOff + '\n' + STUDIO_EMAIL;

  var html = wrapHtml(
    '<p style="margin:0 0 16px;">' + copy.hello + ' ' + esc(lead.name) + ',</p>' +
    '<p style="margin:0 0 20px;">' + copy.thanks + '</p>' +
    detailsTable(rows) +
    '<p style="margin:24px 0 8px;">' + copy.outro + '</p>' +
    '<p style="margin:0 0 24px;color:#666;">' + copy.reply + '</p>' +
    '<p style="margin:0;font-weight:600;">' + copy.signOff + '</p>' +
    '<p style="margin:4px 0 0;"><a href="mailto:' + STUDIO_EMAIL + '" style="color:#2b5fff;">' + STUDIO_EMAIL + '</a> · ' +
    '<a href="https://2099.design" style="color:#2b5fff;">2099.design</a></p>'
  );

  var options = { htmlBody: html, replyTo: STUDIO_EMAIL, name: '2099.studio' };
  // Once Gmail "Send mail as" hola@2099.design is set up, send from it
  if (GmailApp.getAliases().indexOf(STUDIO_EMAIL) !== -1) options.from = STUDIO_EMAIL;

  GmailApp.sendEmail(lead.email, copy.subject, text, options);
}

/* ── Helpers ── */

function getLeadsSheet() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('LEADS_SHEET_ID');
  var spreadsheet = null;

  if (id) {
    try { spreadsheet = SpreadsheetApp.openById(id); } catch (err) { spreadsheet = null; }
  }
  if (!spreadsheet) {
    spreadsheet = SpreadsheetApp.create(SHEET_NAME);
    props.setProperty('LEADS_SHEET_ID', spreadsheet.getId());
  }

  var sheet = spreadsheet.getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function getOrCreateLabel() {
  return GmailApp.getUserLabelByName(GMAIL_LABEL) || GmailApp.createLabel(GMAIL_LABEL);
}

function labelLatestThread(subject) {
  try {
    Utilities.sleep(1500);
    var threads = GmailApp.search('subject:"' + subject.replace(/"/g, '') + '" newer_than:1d', 0, 1);
    if (threads.length) threads[0].addLabel(getOrCreateLabel());
  } catch (err) {
    console.warn('No se pudo etiquetar el lead: ' + err);
  }
}

function detailsTable(rows) {
  return '<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">' +
    rows.map(function (r) {
      return '<tr><td style="padding:10px 12px 10px 0;border-bottom:1px solid #eee;color:#666;font-size:13px;vertical-align:top;white-space:nowrap;">' +
        esc(r[0]) + '</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;">' +
        esc(r[1]).replace(/\n/g, '<br>') + '</td></tr>';
    }).join('') +
    '</table>';
}

function wrapHtml(inner) {
  return '<div style="background:#f2f2f0;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#0d0d0f;">' +
    '<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;font-size:15px;line-height:1.55;">' +
    '<p style="margin:0 0 24px;font-weight:700;font-size:18px;letter-spacing:-0.3px;">2099<span style="color:#2b5fff;">.studio</span></p>' +
    inner +
    '</div></div>';
}

function clean(value, max) {
  return String(value == null ? '' : value).trim().slice(0, max);
}

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
