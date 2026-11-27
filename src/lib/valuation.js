// Copy and options for the home valuation page and the home teaser. L(tr, es, en, de)
import { AREAS, CITY_STATS } from '@/lib/areaContent';

const L = (tr, es, en, de) => ({ tr, es, en, de });
export const vt = (o, l) => (o && (o[l] || o.tr)) || '';

export const VAL = {
  nav: L('Evinizi değerleyelim', 'Valoramos tu vivienda', 'Let us value your home', 'Wir bewerten Ihre Immobilie'),
  title: L('Valencia’da evinizi satmak mı istiyorsunuz?', '¿Quieres vender tu casa en Valencia?', 'Selling your home in Valencia?', 'Möchten Sie Ihre Immobilie in Valencia verkaufen?'),
  sub: L(
    'Valencia Topluluğu’nda (Valencia, Alicante, Costa Blanca, Castellón) evi olanlar için ücretsiz değerleme. Tahmini değeri hemen görün, ardından danışmanımız satış için sizi arasın.',
    'Valoración gratuita para viviendas en la Comunitat Valenciana (Valencia, Alicante, Costa Blanca, Castellón). Ve un valor orientativo al momento y un asesor te llamará para hablar de la venta.',
    'A free valuation for homes in the Valencian Community (Valencia, Alicante, Costa Blanca, Castellón). See an indicative value straight away, then an advisor calls you about selling.',
    'Kostenlose Bewertung für Immobilien in der Comunitat Valenciana (Valencia, Alicante, Costa Blanca, Castellón). Sehen Sie sofort einen Richtwert, danach meldet sich ein Berater zum Verkauf.'),
  formTitle: L('Evinizin bilgileri', 'Datos de tu vivienda', 'About your home', 'Angaben zur Immobilie'),
  where: L('Eviniz nerede?', '¿Dónde está tu vivienda?', 'Where is your home?', 'Wo liegt Ihre Immobilie?'),
  whereHint: L('Şu an yalnızca Valencia Topluluğu’ndaki evleri değerliyoruz.', 'Por ahora solo valoramos viviendas de la Comunitat Valenciana.', 'For now we only value homes in the Valencian Community.', 'Derzeit bewerten wir nur Immobilien in der Comunitat Valenciana.'),
  pick: L('Bölge seçin', 'Elige zona', 'Choose an area', 'Gebiet wählen'),
  groups: { valencia: L('Valencia şehri', 'Ciudad de Valencia', 'Valencia city', 'Stadt Valencia'), alicante: L('Alicante şehri', 'Ciudad de Alicante', 'Alicante city', 'Stadt Alicante'), costa: L('Costa Blanca', 'Costa Blanca', 'Costa Blanca', 'Costa Blanca'), other: L('Diğer', 'Otros', 'Other', 'Sonstige') },
  otherValencia: L('Valencia – başka bir semt', 'Valencia – otro barrio', 'Valencia – another district', 'Valencia – anderer Stadtteil'),
  otherAlicante: L('Alicante – başka bir semt', 'Alicante – otro barrio', 'Alicante – another district', 'Alicante – anderer Stadtteil'),
  otherRegion: L('Valencia Topluluğu’nda başka bir belediye', 'Otro municipio de la Comunitat Valenciana', 'Another town in the Valencian Community', 'Andere Gemeinde in der Comunitat Valenciana'),
  town: L('Belediye / kasaba adı', 'Municipio', 'Town or municipality', 'Gemeinde / Ort'),
  townHint: L('Örn. Castellón, Gandía, Torrevieja', 'Ej. Castellón, Gandía, Torrevieja', 'E.g. Castellón, Gandía, Torrevieja', 'z. B. Castellón, Gandía, Torrevieja'),
  type: L('Konut tipi', 'Tipo de vivienda', 'Property type', 'Objektart'),
  types: { apartment: L('Daire', 'Piso', 'Apartment', 'Wohnung'), penthouse: L('Çatı katı / ático', 'Ático', 'Penthouse', 'Penthouse'), house: L('Müstakil ev / villa / bitişik', 'Casa / chalet / adosado', 'House / villa / townhouse', 'Haus / Villa / Reihenhaus'), other: L('Diğer', 'Otro', 'Other', 'Sonstiges') },
  size: L('Yaklaşık büyüklük (m²)', 'Superficie aproximada (m²)', 'Approx. size (m²)', 'Ungefähre Größe (m²)'),
  beds: L('Yatak odası', 'Dormitorios', 'Bedrooms', 'Schlafzimmer'),
  cond: L('Genel durum', 'Estado general', 'General condition', 'Zustand'),
  conds: { reform: L('Yenilenmesi gerekiyor', 'A reformar', 'Needs renovation', 'Renovierungsbedürftig'), good: L('İyi durumda', 'Buen estado', 'Good condition', 'Guter Zustand'), new: L('Yenilenmiş / yeni', 'Reformada / nueva', 'Renovated / new', 'Renoviert / neu') },
  goal: L('Amacınız', 'Tu objetivo', 'Your goal', 'Ihr Ziel'),
  goals: { sell: L('Satmayı düşünüyorum', 'Quiero vender', 'I am thinking of selling', 'Ich möchte verkaufen'), rent: L('Kiraya vermek istiyorum', 'Quiero alquilar', 'I want to rent it out', 'Ich möchte vermieten'), curious: L('Sadece değerini merak ediyorum', 'Solo quiero saber cuánto vale', 'Just curious about the value', 'Ich möchte nur den Wert wissen') },
  contact: L('İletişim bilgileriniz', 'Tus datos de contacto', 'Your contact details', 'Ihre Kontaktdaten'),
  name: L('Ad soyad', 'Nombre y apellidos', 'Full name', 'Vor- und Nachname'),
  email: L('E-posta', 'Correo electrónico', 'Email', 'E-Mail'),
  phone: L('Telefon / WhatsApp', 'Teléfono / WhatsApp', 'Phone / WhatsApp', 'Telefon / WhatsApp'),
  note: L('Eklemek istedikleriniz (isteğe bağlı)', 'Algo más que quieras contarnos (opcional)', 'Anything else (optional)', 'Weitere Hinweise (optional)'),
  consentA: L('Bilgilerimin değerleme için kullanılmasını kabul ediyorum.', 'Acepto que se usen mis datos para la valoración.', 'I agree to my details being used for the valuation.', 'Ich stimme der Verwendung meiner Daten für die Bewertung zu.'),
  consentB: L('Gizlilik politikası', 'Política de privacidad', 'Privacy policy', 'Datenschutzerklärung'),
  send: L('Tahmini değeri göster', 'Ver valor orientativo', 'Show my estimate', 'Richtwert anzeigen'),
  sending: L('Gönderiliyor…', 'Enviando…', 'Sending…', 'Wird gesendet…'),
  err: L('Gönderilemedi. Lütfen alanları kontrol edip tekrar deneyin.', 'No se pudo enviar. Revisa los campos e inténtalo de nuevo.', 'Could not send. Please check the fields and try again.', 'Senden fehlgeschlagen. Bitte Felder prüfen und erneut versuchen.'),
  required: L('Lütfen zorunlu alanları doldurun.', 'Rellena los campos obligatorios.', 'Please fill in the required fields.', 'Bitte Pflichtfelder ausfüllen.'),
  doneTitle: L('Talebiniz bize ulaştı', 'Hemos recibido tu solicitud', 'We have your request', 'Ihre Anfrage ist bei uns angekommen'),
  resTitle: L('Tahmini değer aralığı', 'Valor orientativo', 'Indicative value range', 'Richtwert-Spanne'),
  resNote: (name, v) => L(`${name} bölgesindeki yayımlanmış ilan fiyatı ortalamasına (${v} €/m²) dayanan kaba bir göstergedir. Gerçek satış fiyatı bu aralığın dışında kalabilir; kesin değeri evi görerek belirleriz.`, `Es una estimación aproximada basada en la media de precios publicados en ${name} (${v} €/m²). El precio real de venta puede quedar fuera de este rango; el valor exacto se fija viendo la vivienda.`, `A rough guide based on the average published asking price in ${name} (${v} €/m²). The real sale price can fall outside this range; the exact value is set after seeing the home.`, `Eine grobe Orientierung auf Basis des durchschnittlichen Angebotspreises in ${name} (${v} €/m²). Der tatsächliche Verkaufspreis kann außerhalb dieser Spanne liegen; den genauen Wert ermitteln wir vor Ort.`),
  resNone: L('Bu konut tipi ve bölge için çevrimiçi aralık veremiyoruz; değer arsa, bina ve konuma göre değiştiği için danışmanımız evi görerek gerekçeli bir değer verecek.', 'Para este tipo de vivienda y zona no podemos dar un rango online; el valor depende de parcela, edificio y ubicación, así que un asesor te dará un valor razonado viendo la vivienda.', 'We cannot give an online range for this property type and area; the value depends on plot, building and location, so an advisor will give a reasoned value after seeing the home.', 'Für diesen Objekttyp und dieses Gebiet können wir online keine Spanne nennen; der Wert hängt von Grundstück, Gebäude und Lage ab, daher nennt ein Berater nach Besichtigung einen begründeten Wert.'),
  doneText: L('Danışmanımız en geç bir iş günü içinde sizinle iletişime geçecek ve evi görmek için uygun bir zaman ayarlayacak.', 'Nuestro asesor te contactará en un día laborable como máximo y acordará una visita para ver la vivienda.', 'Our advisor will contact you within one working day and arrange a time to see the home.', 'Unser Berater meldet sich spätestens innerhalb eines Werktags und vereinbart einen Termin zur Besichtigung.'),
  avgTitle: (name, v) => L(`${name} için bölge ortalaması: ${v} €/m²`, `Media de la zona (${name}): ${v} €/m²`, `Area average for ${name}: ${v} €/m²`, `Gebietsdurchschnitt ${name}: ${v} €/m²`),
  avgText: L(
    'Yayımlanmış ilan fiyatlarının ortalamasıdır, evinizin değeri değildir. Kat, cephe, bakım, sokak ve manzara değeri bundan ciddi biçimde ayırır; bu yüzden rakamı yerinde veriyoruz.',
    'Es la media de precios publicados, no el valor de tu vivienda. Planta, orientación, estado, calle y vistas lo cambian mucho; por eso damos la cifra viendo la vivienda.',
    'This is the average of published asking prices, not the value of your home. Floor, aspect, condition, street and view can move it a lot, which is why we give the figure on site.',
    'Dies ist der Durchschnitt veröffentlichter Angebotspreise, nicht der Wert Ihrer Immobilie. Etage, Ausrichtung, Zustand, Straße und Aussicht verändern ihn stark, deshalb nennen wir den Wert vor Ort.'),
  stepsTitle: L('Nasıl ilerliyor?', '¿Cómo funciona?', 'How it works', 'So geht es weiter'),
  steps: [
    [L('Formu doldurun', 'Rellena el formulario', 'Fill in the form', 'Formular ausfüllen'), L('Bir dakika sürer; evin yeri, tipi ve büyüklüğü yeter.', 'Un minuto: ubicación, tipo y tamaño bastan.', 'It takes a minute: location, type and size are enough.', 'Dauert eine Minute: Lage, Typ und Größe genügen.')],
    [L('Sizi arıyoruz', 'Te llamamos', 'We contact you', 'Wir melden uns'), L('Bir iş günü içinde danışmanımız dönüş yapar, evi birlikte konuşuruz.', 'En un día laborable un asesor te contacta y hablamos de la vivienda.', 'Within one working day an advisor gets back to you to talk about the home.', 'Innerhalb eines Werktags meldet sich ein Berater und bespricht die Immobilie mit Ihnen.')],
    [L('Yerinde değerleme', 'Valoración en persona', 'On-site valuation', 'Bewertung vor Ort'), L('Evi görür, benzer satışlarla karşılaştırır ve gerekçeli bir fiyat veririz.', 'Vemos la vivienda, la comparamos con ventas similares y damos un precio razonado.', 'We see the home, compare it with similar sales and give a reasoned price.', 'Wir sehen uns die Immobilie an, vergleichen mit ähnlichen Verkäufen und nennen einen begründeten Preis.')],
  ],
  factorsTitle: L('Değeri neler belirler?', '¿Qué determina el valor?', 'What decides the value?', 'Was bestimmt den Wert?'),
  factors: [
    [L('Konum ve sokak', 'Ubicación y calle', 'Location and street', 'Lage und Straße'), L('Aynı semtte bile sokaktan sokağa fark eder.', 'Cambia de una calle a otra incluso en el mismo barrio.', 'It differs from street to street, even within one district.', 'Unterscheidet sich von Straße zu Straße, selbst im selben Viertel.')],
    [L('Kat, cephe, manzara', 'Planta, orientación, vistas', 'Floor, aspect, view', 'Etage, Ausrichtung, Aussicht'), L('Asansör, güneş ve deniz manzarası fiyatı belirgin etkiler.', 'Ascensor, sol y vistas al mar influyen claramente.', 'Lift, sun and sea view clearly move the price.', 'Aufzug, Sonne und Meerblick beeinflussen den Preis deutlich.')],
    [L('Bakım ve yaş', 'Estado y antigüedad', 'Condition and age', 'Zustand und Alter'), L('Yenilenmiş bir daire ile yenilenmesi gereken arasında büyük fark olur.', 'Una vivienda reformada y otra por reformar se separan mucho.', 'A renovated flat and one that needs work are far apart.', 'Eine renovierte Wohnung und eine sanierungsbedürftige liegen weit auseinander.')],
    [L('Teras, otopark, havuz', 'Terraza, garaje, piscina', 'Terrace, parking, pool', 'Terrasse, Stellplatz, Pool'), L('Ek alanlar, özellikle sahil bölgesinde fark yaratır.', 'Los extras marcan la diferencia, sobre todo en la costa.', 'Extras make a difference, especially on the coast.', 'Extras machen vor allem an der Küste einen Unterschied.')],
    [L('Piyasanın durumu', 'Momento del mercado', 'Market timing', 'Marktlage'), L('Talep ve arz, benzer evlerin son satış fiyatları.', 'Oferta y demanda y los últimos precios de venta de viviendas similares.', 'Supply, demand and recent sale prices of similar homes.', 'Angebot, Nachfrage und jüngste Verkaufspreise ähnlicher Objekte.')],
    [L('Hukuki durum', 'Situación legal', 'Legal situation', 'Rechtliche Lage'), L('Belgeler, borçlar, kiracı ve turistik kiralama izni.', 'Documentación, cargas, inquilino y licencia turística.', 'Paperwork, charges, tenants and tourist-rental licence.', 'Unterlagen, Belastungen, Mieter und Ferienvermietungslizenz.')],
  ],
  faqTitle: L('Sık sorulanlar', 'Preguntas frecuentes', 'Frequently asked', 'Häufige Fragen'),
  faq: [
    [L('Ücretli mi?', '¿Tiene coste?', 'Does it cost anything?', 'Kostet es etwas?'), L('Hayır. Değerleme ücretsiz ve bağlayıcı değildir; satmak zorunda kalmazsınız.', 'No. La valoración es gratuita y sin compromiso; no estás obligado a vender.', 'No. The valuation is free and non-binding; you are not obliged to sell.', 'Nein. Die Bewertung ist kostenlos und unverbindlich; Sie müssen nicht verkaufen.')],
    [L('Gösterilen rakam ne kadar güvenilir?', '¿Qué fiabilidad tiene la cifra?', 'How reliable is the figure?', 'Wie zuverlässig ist die Zahl?'), L('Çevrimiçi aralık, bölgedeki yayımlanmış ilan fiyatı ortalamalarına dayanan kaba bir göstergedir; geniş olması normaldir. Gerçek değeri danışmanımız evi görüp benzer satışlarla karşılaştırarak belirler.', 'El rango online es una guía aproximada basada en la media de precios publicados en la zona; es normal que sea amplio. El valor real lo fija un asesor viendo la vivienda y comparando con ventas similares.', 'The online range is a rough guide based on average published prices in the area, so it is naturally wide. An advisor sets the real value by seeing the home and comparing it with similar sales.', 'Die Online-Spanne ist eine grobe Orientierung auf Basis veröffentlichter Durchschnittspreise im Gebiet und daher naturgemäß breit. Den realen Wert legt ein Berater nach Besichtigung und Vergleich mit ähnlichen Verkäufen fest.')],
    [L('Hangi bölgelerde yapıyorsunuz?', '¿En qué zonas valoráis?', 'Which areas do you cover?', 'Welche Gebiete bewerten Sie?'), L('Valencia Topluluğu: Valencia, Alicante, Costa Blanca ve Castellón.', 'Comunitat Valenciana: Valencia, Alicante, Costa Blanca y Castellón.', 'The Valencian Community: Valencia, Alicante, the Costa Blanca and Castellón.', 'Comunitat Valenciana: Valencia, Alicante, Costa Blanca und Castellón.')],
    [L('Bilgilerim ne olacak?', '¿Qué pasa con mis datos?', 'What happens to my details?', 'Was passiert mit meinen Daten?'), L('Yalnızca sizinle iletişime geçmek ve değerleme yapmak için kullanılır, üçüncü kişilere satılmaz.', 'Solo se usan para contactarte y valorar la vivienda; no se venden a terceros.', 'They are used only to contact you and value the home, and are never sold to third parties.', 'Sie werden nur zur Kontaktaufnahme und Bewertung verwendet und nie an Dritte verkauft.')],
  ],
  teaser: {
    title: L('Evinizin değeri ne kadar?', '¿Cuánto vale tu vivienda?', 'What is your home worth?', 'Was ist Ihre Immobilie wert?'),
    text: L('Valencia Topluluğu’nda eviniz varsa danışmanımız evi görüp gerekçeli bir değer versin. Ücretsiz, bağlayıcı değil.', 'Si tienes una vivienda en la Comunitat Valenciana, un asesor la visita y te da un valor razonado. Gratis y sin compromiso.', 'If you own a home in the Valencian Community, an advisor visits and gives you a reasoned value. Free and non-binding.', 'Wenn Sie eine Immobilie in der Comunitat Valenciana besitzen, besichtigt ein Berater sie und nennt einen begründeten Wert. Kostenlos und unverbindlich.'),
    cta: L('Değerleme talep et', 'Solicitar valoración', 'Request a valuation', 'Bewertung anfragen'),
  },
};

// Areas offered in the "where is your home" list: only places in the Valencian Community.
export const AREA_OPTIONS = (() => {
  const g = { valencia: [], alicante: [], costa: [] };
  AREAS.forEach((a) => { if (g[a.city]) g[a.city].push({ id: a.id, name: a.name, sale: a.sale, city: a.city }); });
  g.valencia.push({ id: 'valencia-other', name: null, key: 'otherValencia', sale: CITY_STATS.valencia, city: 'valencia' });
  g.alicante.push({ id: 'alicante-other', name: null, key: 'otherAlicante', sale: CITY_STATS.alicante, city: 'alicante' });
  return g;
})();

const costaVals = AREAS.filter((a) => a.city === 'costa' && a.sale).map((a) => a.sale);
const COSTA_AVG = Math.round(costaVals.reduce((x, y) => x + y, 0) / costaVals.length);
export const baseSale = (opt) => opt.sale || (opt.city === 'costa' ? COSTA_AVG : opt.city === 'alicante' ? CITY_STATS.alicante : CITY_STATS.valencia);

// Indicative range for apartments and penthouses only. The adjustments are rough rules of thumb, not market data.
const COND = { reform: 0.85, good: 1, new: 1.08 };
export function estimate(opt, { type, cond, size }) {
  if (!opt || !(type === 'apartment' || type === 'penthouse') || !Number(size)) return null;
  const per = baseSale(opt) * (COND[cond] || 1) * (type === 'penthouse' ? 1.1 : 1);
  const mid = per * Number(size);
  const r = (n) => Math.round(n / 5000) * 5000;
  return { low: r(mid * 0.85), high: r(mid * 1.15), perM2: baseSale(opt) };
}
