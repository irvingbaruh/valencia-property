// Copy for the "How it works" page and the home teaser. L(tr, es, en, de)
const L = (tr, es, en, de) => ({ tr, es, en, de });

export const HOW = {
  nav: L('Üyelik nasıl işler?', '¿Cómo funciona?', 'How it works', 'So funktioniert es'),
  title: L('Üye olunca sizin için ne değişir?', '¿Qué cambia cuando te haces miembro?', 'What changes when you join?', 'Was ändert sich mit der Mitgliedschaft?'),
  sub: L(
    'Ücretsiz üyelik, Valencia ve Alicante’de ev alma sürecini tek bir panelden görmenizi sağlar: beğendikleriniz, belgeleriniz, süreciniz ve bildirimleriniz bir arada.',
    'La cuenta gratuita reúne en un solo panel todo el proceso de comprar en Valencia y Alicante: tus favoritos, documentos, avances y avisos.',
    'A free account puts the whole process of buying in Valencia and Alicante in one panel: your favourites, documents, progress and alerts.',
    'Das kostenlose Konto bündelt den Immobilienkauf in Valencia und Alicante in einem Panel: Favoriten, Dokumente, Fortschritt und Hinweise.'),
  join: L('Ücretsiz üye ol', 'Hazte miembro gratis', 'Join free', 'Kostenlos Mitglied werden'),
  panel: L('Panelime git', 'Ir a mi cuenta', 'Go to my account', 'Zu meinem Konto'),
  sample: L('Ekranlar örnek görünümdür; kişisel veri içermez.', 'Las pantallas son ejemplos ilustrativos, sin datos personales.', 'Screens are illustrative examples and contain no personal data.', 'Die Ansichten sind Beispiele ohne persönliche Daten.'),

  cmpTitle: L('Gezen ziyaretçi ile üye arasındaki fark', 'Visitante o miembro: la diferencia', 'Visitor or member: the difference', 'Besucher oder Mitglied: der Unterschied'),
  guest: L('Üyeliksiz', 'Sin cuenta', 'Without an account', 'Ohne Konto'),
  member: L('Ücretsiz üyeyle', 'Con cuenta gratuita', 'With a free account', 'Mit kostenlosem Konto'),
  guestItems: [
    L('İlk 15 ilanı görürsünüz', 'Ves los primeros 15 anuncios', 'See the first 15 listings', 'Sie sehen die ersten 15 Inserate'),
    L('Rehberin ilk bölümlerini okursunuz', 'Lees el principio de la guía', 'Read the first part of the guide', 'Den Anfang des Ratgebers lesen'),
    L('Her şeyi kendiniz takip edersiniz', 'Sigues todo por tu cuenta', 'You keep track of everything yourself', 'Sie behalten alles selbst im Blick'),
  ],
  memberItems: [
    L('Tüm ilanlar ve rehberin tamamı açılır (15 ilan sınırı kalkar)', 'Todos los anuncios y la guía completa (sin el límite de 15)', 'All listings and the full guide open up (no 15-listing limit)', 'Alle Inserate und der ganze Ratgeber (ohne 15er-Grenze)'),
    L('Beğendiğiniz evler kaydedilir, fiyat değişince haber alırsınız', 'Tus favoritos se guardan y te avisamos si cambia el precio', 'Favourites are saved and you hear about price changes', 'Favoriten werden gespeichert, Preisänderungen melden wir'),
    L('Belgeleriniz ve süreciniz tek yerde, aşama aşama', 'Documentos y proceso en un solo lugar, paso a paso', 'Documents and progress in one place, stage by stage', 'Dokumente und Fortschritt an einem Ort, Schritt für Schritt'),
    L('Telefonunuza bildirim gelir', 'Recibes avisos en el móvil', 'Alerts arrive on your phone', 'Hinweise kommen aufs Handy'),
  ],

  stepsTitle: L('Üç adımda nasıl ilerler?', '¿Cómo avanza en tres pasos?', 'How it works in three steps', 'In drei Schritten'),
  steps: [
    [L('Üye olun', 'Hazte miembro', 'Join', 'Mitglied werden'), L('Ücretsiz hesap açın. Rehber, ilanlar ve bildirimler hemen açılır.', 'Abre una cuenta gratuita. Guía, anuncios y avisos se activan al instante.', 'Open a free account. The guide, listings and alerts unlock straight away.', 'Kostenloses Konto eröffnen. Ratgeber, Inserate und Hinweise sind sofort offen.')],
    [L('Görüşme ayarlayın', 'Reserva una llamada', 'Book a call', 'Gespräch buchen'), L('Panelden size uygun saati seçin; görüntülü ön görüşmede ihtiyacınızı konuşalım.', 'Elige una hora en el panel y hablamos por videollamada de lo que necesitas.', 'Pick a time in the panel and we talk through what you need on a video call.', 'Wählen Sie im Panel eine Zeit; im Videogespräch klären wir Ihren Bedarf.')],
    [L('Süreci panelden izleyin', 'Sigue el proceso en el panel', 'Follow it in your panel', 'Im Panel verfolgen'), L('Hizmetiniz başlayınca her aşamayı, belgeyi ve bildirimi tek ekrandan görürsünüz.', 'Cuando empieza tu servicio ves cada fase, documento y aviso en una sola pantalla.', 'Once your service starts you see every stage, document and alert on one screen.', 'Sobald Ihre Leistung startet, sehen Sie jede Phase, jedes Dokument und jeden Hinweis auf einem Bildschirm.')],
  ],

  toursTitle: L('Panelin içinde neler var?', '¿Qué hay dentro del panel?', 'What is inside the panel?', 'Was steckt im Panel?'),
  tours: [
    { k: 'fav', icon: 'Heart',
      h: L('Favoriler ve fiyat takibi', 'Favoritos y seguimiento de precio', 'Favourites and price tracking', 'Favoriten und Preisverfolgung'),
      p: L('Beğendiğiniz evi kalbe dokunarak kaydedin. Fiyatı değişirse ya da ev satılırsa size haber veririz.', 'Guarda una vivienda con el corazón. Si cambia de precio o se vende, te avisamos.', 'Save a home with the heart. If its price changes or it sells, we tell you.', 'Speichern Sie eine Immobilie mit dem Herz. Ändert sich der Preis oder wird sie verkauft, melden wir uns.') },
    { k: 'notif', icon: 'Bell',
      h: L('Telefonunuza bildirim', 'Avisos en tu móvil', 'Alerts on your phone', 'Hinweise aufs Handy'),
      p: L('Yeni ilan, piyasa notu ya da EUR/TRY kuru hedefinize ulaşınca bildirim gelir. Hangilerini istediğinizi siz seçersiniz ve siteyi uygulama gibi ana ekrana ekleyebilirsiniz.', 'Nuevo anuncio, nota de mercado o el cambio EUR/TRY que has fijado: tú eliges qué recibir, y puedes añadir la web a la pantalla de inicio como una app.', 'New listing, market note or your EUR/TRY target rate: you choose what to receive, and you can add the site to your home screen like an app.', 'Neues Inserat, Marktnotiz oder Ihr EUR/TRY-Zielkurs: Sie wählen, was Sie erhalten, und können die Seite wie eine App zum Startbildschirm hinzufügen.') },
    { k: 'svc', icon: 'Briefcase',
      h: L('Hizmetinizi aşama aşama izleyin', 'Sigue tu servicio fase a fase', 'Follow your service stage by stage', 'Ihre Leistung Schritt für Schritt'),
      p: L('Mülk arama gibi bir hizmet başladığında hangi aşamada olduğumuzu, ne bittiğini ve sırada neyin olduğunu görürsünüz.', 'Cuando empieza un servicio, como la búsqueda de inmuebles, ves en qué fase estamos, qué está hecho y qué viene.', 'When a service such as property search starts, you see which stage we are in, what is done and what comes next.', 'Startet eine Leistung wie die Immobiliensuche, sehen Sie, in welcher Phase wir sind, was erledigt ist und was folgt.') },
    { k: 'doc', icon: 'FileText',
      h: L('Belgeleriniz güvenle tek yerde', 'Tus documentos en un solo lugar', 'Your documents in one place', 'Ihre Dokumente an einem Ort'),
      p: L('Pasaport, NIE gibi belgeleri yükleyin. Her belgenin durumunu görürsünüz: yüklendi, inceleniyor, onaylandı.', 'Sube pasaporte, NIE y más. Ves el estado de cada documento: subido, en revisión, aprobado.', 'Upload your passport, NIE and more. You see each document’s status: uploaded, in review, approved.', 'Laden Sie Reisepass, NIE und mehr hoch. Sie sehen den Status jedes Dokuments: hochgeladen, in Prüfung, genehmigt.') },
    { k: 'meet', icon: 'Video',
      h: L('Görüntülü görüşme randevusu', 'Cita por videollamada', 'Video call booking', 'Termin per Videogespräch'),
      p: L('Takvimden boş bir saat seçin, görüşme bağlantısı hesabınıza gelsin. Görüşmeden önce hatırlatma alırsınız.', 'Elige una hora libre y el enlace llega a tu cuenta. Recibes un recordatorio antes de la llamada.', 'Pick a free slot and the meeting link lands in your account. You get a reminder before the call.', 'Wählen Sie einen freien Termin; der Link erscheint in Ihrem Konto. Vor dem Gespräch gibt es eine Erinnerung.') },
    { k: 'guide', icon: 'MapPin',
      h: L('Valencia & Alicante rehberi ve hesaplayıcılar', 'Guía y calculadoras', 'City guide and calculators', 'Ratgeber und Rechner'),
      p: L('Semt fiyatları, uluslararası okullar, yaşam maliyeti, vize ve vergi; ayrıca yatırım ve alım maliyeti hesaplayıcıları.', 'Precios por barrio, colegios internacionales, coste de vida, visados e impuestos, más calculadoras de inversión y de costes de compra.', 'Neighbourhood prices, international schools, cost of living, visas and tax, plus investment and purchase-cost calculators.', 'Preise je Viertel, internationale Schulen, Lebenshaltung, Visa und Steuern sowie Rendite- und Kaufnebenkosten-Rechner.') },
  ],

  valuesTitle: L('Sonuçta sizin için ne değişir?', 'En resumen, para ti', 'What it means for you', 'Was es für Sie bedeutet'),
  values: [
    ['Layers', L('Tek yerde', 'Todo en un sitio', 'One place', 'Alles an einem Ort'), L('Ev, belge, süreç ve görüşme: mesaj trafiğinde aramanıza gerek kalmaz.', 'Vivienda, documentos, proceso y llamadas: sin buscar entre mensajes.', 'Homes, documents, progress and calls: no digging through message threads.', 'Immobilie, Dokumente, Fortschritt, Gespräche: kein Suchen in Chatverläufen.')],
    ['BellRing', L('Haberdar kalırsınız', 'Siempre informado', 'Stay informed', 'Immer informiert'), L('Önemli bir şey olunca sorup beklemeden bildirim alırsınız.', 'Te avisamos cuando pasa algo importante, sin tener que preguntar.', 'You get an alert when something matters, without having to ask.', 'Bei Wichtigem erhalten Sie eine Nachricht, ohne nachzufragen.')],
    ['Eye', L('Süreç şeffaf', 'Proceso transparente', 'A transparent process', 'Transparenter Ablauf'), L('Hangi aşamada olduğumuzu ve sırada neyin olduğunu her an görürsünüz.', 'Ves en todo momento en qué fase estamos y qué viene.', 'You can always see which stage we are in and what comes next.', 'Sie sehen jederzeit, in welcher Phase wir sind und was als Nächstes kommt.')],
  ],

  ctaTitle: L('Hazırsanız, bir hesap açmanız yeterli.', 'Cuando quieras, basta con abrir una cuenta.', 'Ready when you are: just open an account.', 'Wenn Sie bereit sind, genügt ein Konto.'),
  ctaText: L('Üyelik ücretsiz. Rehber ve bildirimler hemen açılır.', 'La cuenta es gratuita. Guía y avisos se abren al instante.', 'Membership is free. The guide and alerts open straight away.', 'Die Mitgliedschaft ist kostenlos. Ratgeber und Hinweise sind sofort offen.'),
  book: L('Görüşme ayarla', 'Reservar llamada', 'Book a call', 'Gespräch buchen'),

  // Home teaser
  teaser: {
    title: L('Ev alma yolculuğunuz, tek panelde', 'Tu camino a casa, en un solo panel', 'Your home-buying journey, in one panel', 'Ihr Weg zur Immobilie, in einem Panel'),
    text: L('Favorileriniz, belgeleriniz, hizmet süreciniz ve bildirimleriniz tek yerde. Nasıl çalıştığını görsellerle gösterelim.', 'Favoritos, documentos, avance del servicio y avisos en un solo lugar. Te lo mostramos con imágenes.', 'Your favourites, documents, service progress and alerts in one place. See how it works, with pictures.', 'Favoriten, Dokumente, Leistungsfortschritt und Hinweise an einem Ort. So funktioniert es, anschaulich erklärt.'),
    btn: L('Nasıl çalıştığını gör', 'Ver cómo funciona', 'See how it works', 'So funktioniert es'),
    chips: [L('Favoriler', 'Favoritos', 'Favourites', 'Favoriten'), L('Belgeler', 'Documentos', 'Documents', 'Dokumente'), L('Süreç takibi', 'Seguimiento', 'Progress', 'Fortschritt'), L('Bildirimler', 'Avisos', 'Alerts', 'Hinweise')],
  },
  mock: {
    tabs: [L('Favoriler', 'Favoritos', 'Favourites', 'Favoriten'), L('Hizmetler', 'Servicios', 'Services', 'Leistungen'), L('Belgeler', 'Documentos', 'Documents', 'Dokumente'), L('Bildirimler', 'Avisos', 'Alerts', 'Hinweise')],
    welcome: L('Hoş geldiniz', 'Bienvenido', 'Welcome', 'Willkommen'),
    svcName: L('Mülk arama ve danışmanlık', 'Búsqueda de inmuebles', 'Property search & advisory', 'Immobiliensuche & Beratung'),
    stages: [L('Mülk araştırma', 'Búsqueda', 'Property research', 'Immobilienrecherche'), L('Mülk önerileri', 'Propuestas', 'Property proposals', 'Vorschläge'), L('Mülk gezileri', 'Visitas', 'Property viewings', 'Besichtigungen'), L('Teklif', 'Oferta', 'Offer', 'Angebot')],
    done: L('Tamamlandı', 'Completado', 'Completed', 'Abgeschlossen'),
    active: L('Devam ediyor', 'En curso', 'In progress', 'Läuft'),
    pending: L('Beklemede', 'Pendiente', 'Pending', 'Ausstehend'),
    progress: L('İlerleme', 'Avance', 'Progress', 'Fortschritt'),
    home1: L('Valencia · 3 oda', 'Valencia · 3 hab.', 'Valencia · 3 bed', 'Valencia · 3 Zi.'),
    home2: L('Alicante · deniz manzaralı', 'Alicante · vistas al mar', 'Alicante · sea view', 'Alicante · Meerblick'),
    priceDown: L('Fiyat düştü', 'Bajó de precio', 'Price dropped', 'Preis gesenkt'),
    sold: L('Satıldı', 'Vendida', 'Sold', 'Verkauft'),
    example: L('Örnek', 'Ejemplo', 'Example', 'Beispiel'),
    n1: L('Yeni ilan: Valencia, 2 oda', 'Nuevo anuncio: Valencia, 2 hab.', 'New listing: Valencia, 2 bed', 'Neues Inserat: Valencia, 2 Zi.'),
    n2: L('Favoriniz için fiyat güncellendi', 'Cambio de precio en un favorito', 'Price update on a favourite', 'Preisänderung bei einem Favoriten'),
    n3: L('EUR/TRY hedefinize ulaştı', 'El EUR/TRY alcanzó tu objetivo', 'EUR/TRY reached your target', 'EUR/TRY hat Ihr Ziel erreicht'),
    n4: L('Yeni piyasa notu yayında', 'Nueva nota de mercado', 'New market note', 'Neue Marktnotiz'),
    now: L('şimdi', 'ahora', 'now', 'jetzt'),
    d1: L('Pasaport', 'Pasaporte', 'Passport', 'Reisepass'), d2: L('NIE belgesi', 'Documento NIE', 'NIE document', 'NIE-Dokument'), d3: L('Gelir belgesi', 'Justificante de ingresos', 'Proof of income', 'Einkommensnachweis'),
    uploaded: L('Yüklendi', 'Subido', 'Uploaded', 'Hochgeladen'), review: L('İnceleniyor', 'En revisión', 'In review', 'In Prüfung'), approved: L('Onaylandı', 'Aprobado', 'Approved', 'Genehmigt'),
    pickTime: L('Bir saat seçin', 'Elige una hora', 'Pick a time', 'Zeit wählen'),
    days: [L('Pzt', 'Lun', 'Mon', 'Mo'), L('Sal', 'Mar', 'Tue', 'Di'), L('Çar', 'Mié', 'Wed', 'Mi'), L('Per', 'Jue', 'Thu', 'Do')],
    confirmed: L('Görüşme onaylandı', 'Llamada confirmada', 'Call confirmed', 'Gespräch bestätigt'),
    link: L('Bağlantı hesabınızda', 'Enlace en tu cuenta', 'Link in your account', 'Link in Ihrem Konto'),
    g: [L('Semt fiyatları', 'Precios por barrio', 'Neighbourhood prices', 'Viertelpreise'), L('Okullar', 'Colegios', 'Schools', 'Schulen'), L('Yaşam maliyeti', 'Coste de vida', 'Cost of living', 'Lebenshaltung'), L('Vize ve vergi', 'Visados e impuestos', 'Visas and tax', 'Visa und Steuern'), L('Yatırım hesaplayıcı', 'Calculadora de inversión', 'Investment calculator', 'Renditerechner'), L('Alım maliyeti', 'Costes de compra', 'Purchase costs', 'Kaufnebenkosten')],
  },
};
export const hw = (o, locale) => (o && (o[locale] || o.tr)) || '';
