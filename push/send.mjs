// Verschickt fällige Erinnerungen als Web Push. Läuft alle 10 Minuten über GitHub Actions.
// Konfiguration kommt aus dem Secret PUSH_CONFIG (Base64 JSON, in der App erzeugt).
import webpush from 'web-push';
import fs from 'node:fs';

const raw = process.env.PUSH_CONFIG;
if (!raw) { console.log('Kein PUSH_CONFIG gesetzt, nichts zu tun.'); process.exit(0); }
const cfg = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
const tz = cfg.tz || 'Europe/Berlin';
webpush.setVapidDetails('https://matzeengel.github.io/aufbau-app/', cfg.vapid.pub, cfg.vapid.priv);

const STATE = 'push-state/last.txt';
const now = Date.now();
let last = now - 15 * 60000;
try { last = Math.max(Number(fs.readFileSync(STATE, 'utf8')) || last, now - 45 * 60000); } catch (e) {}

// Ortszeit als Minuten seit Wochenbeginn (Montag 0:00) in der Zeitzone
function localParts(ms) {
  const f = new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
  const p = Object.fromEntries(f.formatToParts(new Date(ms)).map(x => [x.type, x.value]));
  const wd = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(p.weekday);
  return { wd, min: (Number(p.hour) % 24) * 60 + Number(p.minute) };
}
const due = [];
for (let t = last + 60000 - (last % 60000); t <= now; t += 60000) {
  const lp = localParts(t);
  for (const r of cfg.rem || []) {
    const [h, m] = r.t.split(':').map(Number);
    if (r.d.includes(lp.wd) && h * 60 + m === lp.min) due.push(r);
  }
}
for (const r of due) {
  try {
    await webpush.sendNotification(cfg.sub, JSON.stringify({ title: r.title, body: r.body, tag: r.title }), { TTL: 3600 });
    console.log('Gesendet:', r.title);
  } catch (e) { console.log('Fehler bei', r.title, e.statusCode || e.message); }
}
fs.mkdirSync('push-state', { recursive: true });
fs.writeFileSync(STATE, String(now));
console.log('Geprüft bis', new Date(now).toISOString(), 'fällig:', due.length);
