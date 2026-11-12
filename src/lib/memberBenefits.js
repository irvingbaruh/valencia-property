// What a free membership includes. Shown to visitors on the sign-in page, the home teaser and the locked city guide.
const tr = {
  guideLabel: 'Valencia & Alicante rehberi',
  teaser: { title: 'Üye olun, Valencia & Alicante rehberi sizi bekliyor', text: 'Ücretsiz üyelikle Valencia ve Alicante şehir rehberi, semt fiyatları, uluslararası okullar, favoriler, yeni ilan ve piyasa bildirimleri hesabınızda.', btn: 'Üyelik avantajları' },
  title: 'Üyelikle neler geliyor?', intro: 'Üyelik ücretsiz. Üye olunca hesabınızda şunlar açılır:',
  items: [
    ['Valencia & Alicante rehberi', 'Valencia ve Alicante hayatı, semt semt fiyat ve kira, uluslararası okullar ve çevre kasabalar.'],
    ['Favoriler ve fiyat takibi', 'Beğendiğiniz ilanları kaydedin; fiyatı değişirse ya da satılırsa haber alın.'],
    ['Yeni ilan bildirimleri', 'Portföye yeni mülk girince telefonunuza bildirim gelsin.'],
    ['Piyasa haberleri ve canlı kur', 'Piyasa notları, blog yazıları ve EUR/TRY kuru için hedef bildirimi.'],
    ['Belgeler ve hizmet takibi', 'Belgelerinizi yükleyin, hizmet sürecinizi tek yerden izleyin.'],
    ['Telefona uygulama olarak indirin', 'Ana ekrana ekleyin, bildirimler ve hesabınız tek dokunuşta açılsın.'],
  ],
  locked: 'Valencia & Alicante rehberi sadece üyelere açık', lockedText: 'Ücretsiz üye olun ya da giriş yapın; rehberin tamamı açılsın.', join: 'Üye ol veya giriş yap', open: 'Rehbere git', cards: 'Rehber sayfaları',
};
const es = {
  guideLabel: 'Guía Valencia y Alicante',
  teaser: { title: 'Hazte miembro y accede a la guía de Valencia y Alicante', text: 'Con la cuenta gratuita: guía de Valencia y Alicante, precios por barrio, colegios internacionales, favoritos y avisos de nuevos anuncios y del mercado.', btn: 'Ventajas de ser miembro' },
  title: '¿Qué incluye ser miembro?', intro: 'La cuenta es gratuita. Al registrarte se abre esto:',
  items: [
    ['Guía Valencia y Alicante', 'La vida en Valencia y Alicante, precios y alquileres por barrio, colegios internacionales y pueblos cercanos.'],
    ['Favoritos y seguimiento de precio', 'Guarda los anuncios que te gusten y entérate si cambian de precio o se venden.'],
    ['Avisos de nuevos anuncios', 'Una notificación en el móvil cuando entra una propiedad nueva.'],
    ['Noticias del mercado y cambio en vivo', 'Notas de mercado, artículos del blog y alertas del cambio EUR/TRY.'],
    ['Documentos y seguimiento de servicios', 'Sube tus documentos y sigue tus servicios en un solo lugar.'],
    ['Instálala como app en el móvil', 'Añádela a la pantalla de inicio: avisos y tu cuenta a un toque.'],
  ],
  locked: 'La guía de Valencia y Alicante es solo para miembros', lockedText: 'Hazte miembro gratis o accede para ver la guía completa.', join: 'Hazte miembro o accede', open: 'Ir a la guía', cards: 'Páginas de la guía',
};
const en = {
  guideLabel: 'Valencia & Alicante guide',
  teaser: { title: 'Join to unlock the Valencia & Alicante guide', text: 'A free account gives you the Valencia and Alicante city guide, neighbourhood prices, international schools, favourites, and alerts for new listings and market news.', btn: 'See membership benefits' },
  title: 'What does membership include?', intro: 'Membership is free. Once you join, your account opens up:',
  items: [
    ['Valencia & Alicante guide', 'Life in Valencia and Alicante, prices and rents by neighbourhood, international schools and nearby towns.'],
    ['Favourites and price tracking', 'Save listings you like and hear when the price changes or it sells.'],
    ['New listing alerts', 'A phone notification when a new property joins the portfolio.'],
    ['Market news and live rate', 'Market notes, blog posts and EUR/TRY rate alerts.'],
    ['Documents and service tracking', 'Upload your documents and follow your services in one place.'],
    ['Install as a phone app', 'Add it to your home screen: alerts and your account one tap away.'],
  ],
  locked: 'The city guide is for members only', lockedText: 'Join free or log in to open the full guide.', join: 'Join or log in', open: 'Open the guide', cards: 'Guide pages',
};
const de = {
  guideLabel: 'Valencia & Alicante Ratgeber',
  teaser: { title: 'Mitglied werden und den Valencia & Alicante Ratgeber freischalten', text: 'Mit dem kostenlosen Konto: Ratgeber für Valencia und Alicante, Preise je Viertel, internationale Schulen, Favoriten sowie Hinweise zu neuen Inseraten und Marktnews.', btn: 'Vorteile der Mitgliedschaft' },
  title: 'Was bietet die Mitgliedschaft?', intro: 'Die Mitgliedschaft ist kostenlos. Nach der Anmeldung öffnet sich Ihr Konto:',
  items: [
    ['Valencia & Alicante Ratgeber', 'Leben in Valencia und Alicante, Preise und Mieten je Viertel, internationale Schulen und Orte der Umgebung.'],
    ['Favoriten und Preisverfolgung', 'Speichern Sie Inserate und erfahren Sie, wenn sich der Preis ändert oder sie verkauft werden.'],
    ['Hinweise zu neuen Inseraten', 'Eine Handy-Benachrichtigung, wenn eine neue Immobilie ins Portfolio kommt.'],
    ['Marktnews und Live-Kurs', 'Marktnotizen, Blogartikel und Kurswarnungen für EUR/TRY.'],
    ['Dokumente und Leistungsverfolgung', 'Laden Sie Dokumente hoch und verfolgen Sie Ihre Leistungen an einem Ort.'],
    ['Als Handy-App installieren', 'Zum Startbildschirm hinzufügen: Hinweise und Ihr Konto mit einem Tipp.'],
  ],
  locked: 'Der Valencia & Alicante Ratgeber ist nur für Mitglieder', lockedText: 'Kostenlos Mitglied werden oder anmelden, um den ganzen Führer zu öffnen.', join: 'Mitglied werden oder anmelden', open: 'Zum Ratgeber', cards: 'Seiten des Führers',
};
const B = { tr, es, en, de };
export const benefits = (locale) => B[locale] || B.tr;
