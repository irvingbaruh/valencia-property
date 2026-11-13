// Copy for the video-call booking (member panel, call-to-action cards). Four languages.
const T = {
  tr: {
    title: 'Ücretsiz görüntülü ön görüşme', sub: '30 dakikada bütçenizi, bölgeyi ve süreci konuşalım. Yükümlülük yok.',
    cta: 'Görüşme saati seçin', guestCta: 'Ücretsiz üye olup saat seçin', pickDay: 'Gün seçin', pickTime: 'Saat seçin',
    tz: 'Saatler İspanya saatiyle (Valencia).', yours: (t) => `Sizin saatinizle ${t}`, none: 'Bu gün için boş saat kalmadı.', closed: 'Şu anda çevrim içi randevu alınmıyor. Bize WhatsApp’tan yazabilirsiniz.',
    channel: 'Nasıl görüşelim?', meet: 'Google Meet', whatsapp: 'WhatsApp görüntülü', phone: 'Telefon',
    topic: 'Konu', topics: ['Mülk arama ve yatırım', 'Oturum, vize ve taşınma', 'Vergi ve hukuki süreç', 'Kira yönetimi, tadilat, dekorasyon', 'Genel tanışma'],
    note: 'Eklemek istediğiniz not (isteğe bağlı)', confirm: 'Randevuyu onayla', booking: 'Kaydediliyor…',
    booked: 'Görüşmeniz planlandı', bookedText: 'Görüşmeden önce bağlantıyı burada ve bildirimlerinizde göreceksiniz. 1 saat kala hatırlatma göndeririz.',
    join: 'Görüşmeye katıl', linkSoon: 'Bağlantı görüşmeden önce burada görünecek.', waNote: 'Sizi WhatsApp’tan arayacağız; profilinizde telefon numaranızın kayıtlı olduğundan emin olun.',
    phoneNote: 'Sizi profilinizde kayıtlı numaradan arayacağız.', cancel: 'Randevuyu iptal et', cancelAsk: 'Randevu iptal edilsin mi?', change: 'Başka saat seç',
    err: { taken: 'Bu saat az önce doldu. Lütfen başka bir saat seçin.', already: 'Zaten planlanmış bir görüşmeniz var.', slot: 'Bu saat artık uygun değil. Lütfen başka bir saat seçin.', other: 'Randevu kaydedilemedi. Lütfen tekrar deneyin.' },
  },
  es: {
    title: 'Videollamada inicial gratuita', sub: 'En 30 minutos hablamos de su presupuesto, la zona y el proceso. Sin compromiso.',
    cta: 'Elegir hora', guestCta: 'Regístrese gratis y elija hora', pickDay: 'Elija un día', pickTime: 'Elija una hora',
    tz: 'Horas en horario de España (Valencia).', yours: (t) => `En su hora local: ${t}`, none: 'No quedan horas libres este día.', closed: 'Ahora mismo no se pueden reservar citas en línea. Escríbanos por WhatsApp.',
    channel: '¿Cómo hablamos?', meet: 'Google Meet', whatsapp: 'Videollamada por WhatsApp', phone: 'Teléfono',
    topic: 'Tema', topics: ['Búsqueda de vivienda e inversión', 'Residencia, visado y mudanza', 'Impuestos y proceso legal', 'Gestión de alquiler, reforma, decoración', 'Primera toma de contacto'],
    note: 'Nota (opcional)', confirm: 'Confirmar cita', booking: 'Guardando…',
    booked: 'Su cita está reservada', bookedText: 'Antes de la cita verá el enlace aquí y en sus notificaciones. Le enviaremos un recordatorio una hora antes.',
    join: 'Unirse a la llamada', linkSoon: 'El enlace aparecerá aquí antes de la cita.', waNote: 'Le llamaremos por WhatsApp; compruebe que su teléfono está en su perfil.',
    phoneNote: 'Le llamaremos al número de su perfil.', cancel: 'Cancelar la cita', cancelAsk: '¿Cancelar la cita?', change: 'Elegir otra hora',
    err: { taken: 'Esa hora se acaba de ocupar. Elija otra, por favor.', already: 'Ya tiene una cita reservada.', slot: 'Esa hora ya no está disponible. Elija otra, por favor.', other: 'No se pudo guardar la cita. Inténtelo de nuevo.' },
  },
  en: {
    title: 'Free intro video call', sub: 'In 30 minutes we talk through your budget, the area and the process. No obligation.',
    cta: 'Pick a time', guestCta: 'Join free and pick a time', pickDay: 'Pick a day', pickTime: 'Pick a time',
    tz: 'Times are in Spain time (Valencia).', yours: (t) => `Your time: ${t}`, none: 'No free times left on this day.', closed: 'Online booking is closed right now. You can message us on WhatsApp.',
    channel: 'How shall we talk?', meet: 'Google Meet', whatsapp: 'WhatsApp video', phone: 'Phone',
    topic: 'Topic', topics: ['Property search and investment', 'Residence, visa and moving', 'Tax and legal process', 'Rental management, renovation, decoration', 'General introduction'],
    note: 'Anything to add (optional)', confirm: 'Confirm booking', booking: 'Saving…',
    booked: 'Your call is booked', bookedText: 'You will see the link here and in your notifications before the call. We send a reminder one hour before.',
    join: 'Join the call', linkSoon: 'The link will appear here before the call.', waNote: 'We will call you on WhatsApp; please make sure your phone number is in your profile.',
    phoneNote: 'We will call the number in your profile.', cancel: 'Cancel booking', cancelAsk: 'Cancel this booking?', change: 'Pick another time',
    err: { taken: 'That time was just taken. Please pick another.', already: 'You already have a call booked.', slot: 'That time is no longer available. Please pick another.', other: 'The booking could not be saved. Please try again.' },
  },
  de: {
    title: 'Kostenloses Video-Erstgespräch', sub: 'In 30 Minuten besprechen wir Budget, Lage und Ablauf. Unverbindlich.',
    cta: 'Termin wählen', guestCta: 'Kostenlos anmelden und Termin wählen', pickDay: 'Tag wählen', pickTime: 'Uhrzeit wählen',
    tz: 'Zeiten in spanischer Zeit (Valencia).', yours: (t) => `Ihre Zeit: ${t}`, none: 'An diesem Tag ist kein Termin mehr frei.', closed: 'Online-Termine sind derzeit nicht möglich. Schreiben Sie uns per WhatsApp.',
    channel: 'Wie sprechen wir?', meet: 'Google Meet', whatsapp: 'WhatsApp-Video', phone: 'Telefon',
    topic: 'Thema', topics: ['Immobiliensuche und Investition', 'Aufenthalt, Visum und Umzug', 'Steuern und rechtlicher Ablauf', 'Mietverwaltung, Renovierung, Einrichtung', 'Allgemeines Kennenlernen'],
    note: 'Anmerkung (optional)', confirm: 'Termin bestätigen', booking: 'Wird gespeichert…',
    booked: 'Ihr Gespräch ist gebucht', bookedText: 'Den Link sehen Sie vor dem Gespräch hier und in Ihren Benachrichtigungen. Eine Stunde vorher erinnern wir Sie.',
    join: 'Am Gespräch teilnehmen', linkSoon: 'Der Link erscheint hier vor dem Gespräch.', waNote: 'Wir rufen Sie per WhatsApp an; bitte prüfen Sie, dass Ihre Telefonnummer im Profil steht.',
    phoneNote: 'Wir rufen die Nummer in Ihrem Profil an.', cancel: 'Termin absagen', cancelAsk: 'Termin absagen?', change: 'Andere Zeit wählen',
    err: { taken: 'Diese Zeit wurde gerade vergeben. Bitte wählen Sie eine andere.', already: 'Sie haben bereits einen Termin.', slot: 'Diese Zeit ist nicht mehr verfügbar. Bitte wählen Sie eine andere.', other: 'Der Termin konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.' },
  },
};
export const bookingText = (locale) => T[locale] || T.en;

const TZ = 'Europe/Madrid';
const LOCALE_TAG = { tr: 'tr-TR', es: 'es-ES', en: 'en-GB', de: 'de-DE' };
const parts = (d) => Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(d).map((p) => [p.type, p.value]));

// The instant at which the clock in Spain shows y-m-d hh:mm
export function madridInstant(y, m, d, hh, mm) {
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const p = parts(new Date(guess));
  const shown = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute);
  return new Date(guess - (shown - guess));
}

// Free slots grouped by Spanish calendar day: [{ key: '2026-11-17', date: Date, slots: [Date] }]
export function buildDays(settings, taken, now = new Date()) {
  const s = settings || {};
  if (!s.enabled) return [];
  const slot = Math.max(Number(s.slot) || 30, 10);
  const [sh, sm] = String(s.start || '10:00').split(':').map(Number);
  const [eh, em] = String(s.end || '18:00').split(':').map(Number);
  const first = now.getTime() + (Number(s.notice_h) || 24) * 3600e3;
  const last = now.getTime() + (Number(s.max_days) || 21) * 86400e3;
  const busy = new Set((taken || []).map((t) => new Date(t).getTime()));
  const today = parts(now);
  const out = [];
  for (let i = 0; i <= (Number(s.max_days) || 21) + 1; i++) {
    const noon = madridInstant(+today.year, +today.month, +today.day + i, 12, 0); // Date.UTC rolls the day over for us
    const p = parts(noon);
    const dow = ((noon.getUTCDay() + 6) % 7) + 1; // at Spanish noon the UTC weekday equals the Spanish weekday
    if (!(s.days || []).includes(dow)) continue;
    const slots = [];
    for (let min = sh * 60 + sm; min + slot <= eh * 60 + em; min += slot) {
      const t = madridInstant(+p.year, +p.month, +p.day, Math.floor(min / 60), min % 60);
      if (t.getTime() >= first && t.getTime() <= last && !busy.has(t.getTime())) slots.push(t);
    }
    if (slots.length) out.push({ key: `${p.year}-${p.month}-${p.day}`, date: noon, slots });
  }
  return out;
}

export const fmtDay = (d, locale) => new Intl.DateTimeFormat(LOCALE_TAG[locale] || 'en-GB', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short' }).format(d);
export const fmtTime = (d, tz = TZ) => new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d);
export const fmtFull = (d, locale) => new Intl.DateTimeFormat(LOCALE_TAG[locale] || 'en-GB', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(d));
export const localTime = (d) => {
  const here = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const a = fmtTime(d);
  const b = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d);
  return here !== TZ && a !== b ? b : '';
};
