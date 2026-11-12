'use client';

import { useLocale } from 'next-intl';
import { Briefcase, FileText, Bell, Check } from 'lucide-react';
import { localePath } from '@/lib/routes';

// What a new member sees before anything has happened: what this tab is for and what will show up here.
const TEXT = {
  tr: {
    services: { title: 'Hizmetlerim', intro: 'Bizden aldığınız hizmetler burada toplanır.', bullets: ['Mülk arama, hukuki destek (NIE, banka hesabı, noter ve tapu), dekorasyon, tadilat, kira yönetimi gibi hizmetlerden hangisini aldıysanız burada görürsünüz.', 'Her hizmetin tüm aşamaları başvurunun yapılmasından işlemin tamamlanmasına kadar sırayla listelenir.', 'Her aşamanın durumunu (bekliyor, sürüyor, tamamlandı) ve tahmini süresini takip edersiniz.'], cta: 'Bir hizmete ihtiyacınız varsa danışmanlık formunu doldurun', soon: 'Bir hizmet başladığında bu sayfa kendiliğinden dolar.' },
    documents: { title: 'Dosyalarım', intro: 'Aldığınız hizmetlerle ilgili belgeler burada toplanır.', bullets: ['Bir hizmet için belge gerektiğinde (örneğin pasaport kopyası, NIE, banka belgesi) buradan yüklersiniz.', 'Yüklediğiniz her belgenin durumu (yüklendi, onaylandı, reddedildi) ve varsa ret nedeni görünür.', 'Dilerseniz klasör açıp dosyalarınızı düzenleyebilirsiniz. Dosyaları yalnızca siz ve ekibimiz görür.'], soon: 'İstenen belge olursa size bildirim göndeririz.' },
    notifications: { title: 'Bildirimler', intro: 'Hizmetinizdeki her gelişme burada görünür.', bullets: ['Bir hizmet size atandığında haber alırsınız.', 'Her aşama güncellendiğinde (başvuru yapıldı, onay bekleniyor, tamamlandı gibi) bildirim gelir.', 'Aynı bildirimleri e-postayla da alırsınız.', 'Uygulamayı telefonunuza kurup bildirimleri açarsanız her ilerleme anında telefonunuza da düşer.'], soon: 'Bildirim anahtarı sayfanın üst kısmında.' },
  },
  es: {
    services: { title: 'Mis servicios', intro: 'Aquí se reúnen los servicios que contrata con nosotros.', bullets: ['Verá aquí los que haya contratado: búsqueda de vivienda, apoyo legal (NIE, cuenta bancaria, notaría y escritura), decoración, reforma o gestión de alquiler.', 'Cada servicio muestra todas sus fases en orden, desde la solicitud hasta que el trámite termina.', 'Sigue el estado de cada fase (pendiente, en curso, completada) y su plazo estimado.'], cta: 'Si necesita un servicio, rellene el formulario de consulta', soon: 'Esta página se rellena sola cuando empieza un servicio.' },
    documents: { title: 'Mis archivos', intro: 'Aquí se reúnen los documentos de los servicios que contrata.', bullets: ['Cuando un servicio necesite documentos (por ejemplo copia del pasaporte, NIE o certificado bancario), los sube desde aquí.', 'Verá el estado de cada documento (subido, aprobado, rechazado) y el motivo si se rechaza.', 'Puede crear carpetas y ordenar sus archivos. Solo usted y nuestro equipo los ven.'], soon: 'Si hace falta un documento, le avisaremos.' },
    notifications: { title: 'Notificaciones', intro: 'Aquí aparece cada novedad de su servicio.', bullets: ['Le avisamos cuando se le asigna un servicio.', 'Recibe una notificación cada vez que avanza una fase (solicitud presentada, pendiente de aprobación, completada...).', 'Las mismas notificaciones le llegan también por correo.', 'Si instala la app en el móvil y activa las notificaciones, cada avance le llega al instante al teléfono.'], soon: 'El interruptor de notificaciones está en la parte superior de la página.' },
  },
  en: {
    services: { title: 'My services', intro: 'The services you take from us are collected here.', bullets: ['You will see whichever you take: property search, legal support (NIE, bank account, notary and deed), decoration, renovation or rental management.', 'Each service lists all of its stages in order, from the application to the completion of the process.', 'You follow the status of each stage (waiting, in progress, completed) and its estimated time.'], cta: 'If you need a service, fill in the consultation form', soon: 'This page fills in by itself once a service starts.' },
    documents: { title: 'My files', intro: 'Documents for the services you take are collected here.', bullets: ['When a service needs documents (for example a passport copy, NIE or bank certificate) you upload them here.', 'You see the status of every document (uploaded, approved, rejected) and the reason if one is rejected.', 'You can create folders and organise your files. Only you and our team can see them.'], soon: 'If a document is needed, we will notify you.' },
    notifications: { title: 'Notifications', intro: 'Every development in your service shows up here.', bullets: ['You are told when a service is assigned to you.', 'You get a notification each time a stage moves on (application submitted, waiting for approval, completed and so on).', 'The same notifications also reach you by e-mail.', 'If you install the app on your phone and switch notifications on, every step arrives on your phone right away.'], soon: 'The notification switch is at the top of the page.' },
  },
  de: {
    services: { title: 'Meine Leistungen', intro: 'Hier sammeln sich die Leistungen, die Sie bei uns beziehen.', bullets: ['Sie sehen hier, was Sie beziehen: Immobiliensuche, Rechtsberatung (NIE, Bankkonto, Notar und Eintragung), Einrichtung, Renovierung oder Mietverwaltung.', 'Jede Leistung zeigt alle Schritte der Reihe nach, vom Antrag bis zum Abschluss des Vorgangs.', 'Sie verfolgen den Status jedes Schritts (wartet, läuft, abgeschlossen) und die geschätzte Dauer.'], cta: 'Wenn Sie eine Leistung brauchen, füllen Sie das Beratungsformular aus', soon: 'Diese Seite füllt sich von selbst, sobald eine Leistung beginnt.' },
    documents: { title: 'Meine Dateien', intro: 'Hier sammeln sich die Unterlagen zu Ihren Leistungen.', bullets: ['Wenn eine Leistung Unterlagen braucht (zum Beispiel Passkopie, NIE oder Bankbescheinigung), laden Sie sie hier hoch.', 'Sie sehen den Status jedes Dokuments (hochgeladen, genehmigt, abgelehnt) und bei Ablehnung den Grund.', 'Sie können Ordner anlegen und Ihre Dateien ordnen. Nur Sie und unser Team sehen sie.'], soon: 'Wird ein Dokument benötigt, benachrichtigen wir Sie.' },
    notifications: { title: 'Benachrichtigungen', intro: 'Jede Entwicklung bei Ihrer Leistung erscheint hier.', bullets: ['Sie erfahren, wenn Ihnen eine Leistung zugewiesen wird.', 'Bei jedem neuen Schritt (Antrag gestellt, wartet auf Genehmigung, abgeschlossen usw.) erhalten Sie eine Meldung.', 'Dieselben Meldungen kommen auch per E-Mail.', 'Wenn Sie die App auf dem Handy installieren und Benachrichtigungen einschalten, landet jeder Fortschritt sofort auf Ihrem Handy.'], soon: 'Der Schalter für Benachrichtigungen ist oben auf der Seite.' },
  },
};
const ICONS = { services: Briefcase, documents: FileText, notifications: Bell };

export default function PanelEmptyInfo({ kind }) {
  const locale = useLocale();
  const tx = (TEXT[locale] || TEXT.en)[kind];
  const Icon = ICONS[kind];
  return (
    <div className="dark-card rounded-2xl shadow-sm p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-light text-gold"><Icon size={20} /></span>
        <h3 className="text-lg font-serif text-[var(--color-dark)]">{tx.title}</h3>
      </div>
      <p className="text-[var(--color-charcoal)] mb-4">{tx.intro}</p>
      <ul className="space-y-2.5 mb-5">
        {tx.bullets.map((b) => (
          <li key={b} className="flex gap-2.5 text-sm text-[var(--color-charcoal)] leading-relaxed">
            <Check size={16} className="text-gold shrink-0 mt-0.5" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <p className="text-sm text-text-muted">{tx.soon}</p>
      {tx.cta && (
        <a href={localePath(locale, 'hizmetler', '#consultation-form')} className="inline-block mt-4 text-sm font-medium text-gold hover:underline">{tx.cta}</a>
      )}
    </div>
  );
}
