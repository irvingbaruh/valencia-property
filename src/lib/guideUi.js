// Copy for the city-guide screens (hub, life, areas, coast, activities, schools). Members only.
const L = (tr, es, en, de) => ({ tr, es, en, de });

export const PAGES = {
  rehber: { nav: L('Genel bakış', 'Resumen', 'Overview', 'Überblick'), title: L('Valencia & Alicante rehberi', 'Guía Valencia y Alicante', 'Valencia & Alicante guide', 'Valencia & Alicante Ratgeber'),
    sub: L('Valencia, Alicante ve Costa Blanca: yaşam, semtler, okullar ve yapılacaklar.', 'Valencia, Alicante y la Costa Blanca: vida diaria, barrios, colegios y planes.', 'Valencia, Alicante and the Costa Blanca: daily life, neighbourhoods, schools and things to do.', 'Valencia, Alicante und Costa Blanca: Alltag, Viertel, Schulen und Aktivitäten.'),
    hero: 'calpe-bay' },
  yasam: { nav: L('Yaşam ve ulaşım', 'Vida y transporte', 'Life & transport', 'Alltag & Verkehr'), title: L('Yaşam, ulaşım ve güvenlik', 'Vida, transporte y seguridad', 'Life, transport and safety', 'Alltag, Verkehr und Sicherheit'),
    sub: L('Günlük hayat nasıl, nasıl dolaşılır, nelere dikkat edilir.', 'Cómo es el día a día, cómo moverse y a qué prestar atención.', 'What daily life is like, how to get around and what to watch for.', 'Wie der Alltag aussieht, wie man sich bewegt und worauf man achten sollte.'),
    hero: 'altea-flowers', meta: L('Valencia ve Alicante’de yaşam, ulaşım ve güvenlik', 'Vida, transporte y seguridad en Valencia y Alicante', 'Life, transport and safety in Valencia and Alicante', 'Alltag, Verkehr und Sicherheit in Valencia und Alicante') },
  semtler: { nav: L('Semtler', 'Barrios', 'Neighbourhoods', 'Viertel'), title: L('Valencia ve Alicante semtleri', 'Barrios de Valencia y Alicante', 'Valencia and Alicante neighbourhoods', 'Viertel in Valencia und Alicante'),
    sub: L('Fiyat, kira ve karakter bir arada.', 'Precio, alquiler y carácter en un solo lugar.', 'Price, rent and character in one place.', 'Preis, Miete und Charakter an einem Ort.'), hero: 'alicante' },
  bolgeler: { nav: L('Costa Blanca', 'Costa Blanca', 'Costa Blanca', 'Costa Blanca'), title: L('Costa Blanca kasabaları', 'Pueblos de la Costa Blanca', 'Costa Blanca towns', 'Orte der Costa Blanca'),
    sub: L('Altea, Calpe, Benidorm, Jávea ve diğerleri: hangisi kime uygun.', 'Altea, Calpe, Benidorm, Jávea y más: cuál encaja con cada perfil.', 'Altea, Calpe, Benidorm, Jávea and more: which suits whom.', 'Altea, Calpe, Benidorm, Jávea und mehr: was zu wem passt.'), hero: 'benidorm',
    meta: L('Costa Blanca kasabaları: Altea, Calpe, Benidorm, Jávea', 'Pueblos de la Costa Blanca: Altea, Calpe, Benidorm, Jávea', 'Costa Blanca towns: Altea, Calpe, Benidorm, Jávea', 'Orte der Costa Blanca: Altea, Calpe, Benidorm, Jávea') },
  nerede: { nav: L('Şehir içi', 'Dentro de la ciudad', 'Inside the city', 'In der Stadt'), title: L('Şehrin içinde ne nerede?', '¿Qué hay dónde?', 'What is where?', 'Was ist wo?'),
    sub: L('Valencia ve Alicante’de semt semt gece hayatı, restoranlar, kültür ve plajlar.', 'Valencia y Alicante barrio a barrio: ocio nocturno, restaurantes, cultura y playas.', 'Valencia and Alicante area by area: nightlife, restaurants, culture and beaches.', 'Valencia und Alicante Viertel für Viertel: Nachtleben, Restaurants, Kultur und Strände.'), hero: 'a-santacruz',
    meta: L('Valencia ve Alicante şehir içi rehberi', 'Guía por barrios de Valencia y Alicante', 'Valencia and Alicante area guide', 'Viertelführer Valencia und Alicante') },
  aktiviteler: { nav: L('Aktiviteler', 'Actividades', 'Things to do', 'Aktivitäten'), title: L('Neler yapılır?', '¿Qué hacer?', 'Things to do', 'Was kann man unternehmen?'),
    sub: L('Festivaller, doğa, deniz ve gastronomi: dolu bir takvim.', 'Fiestas, naturaleza, mar y gastronomía: un calendario lleno.', 'Festivals, nature, sea and food: a full calendar.', 'Feste, Natur, Meer und Gastronomie: ein voller Kalender.'), hero: 'calpe-stairs',
    meta: L('Valencia ve Alicante’de yapılacaklar', 'Qué hacer en Valencia y Alicante', 'Things to do in Valencia and Alicante', 'Aktivitäten in Valencia und Alicante') },
  okullar: { nav: L('Okullar', 'Colegios', 'Schools', 'Schulen'), title: L('Uluslararası okullar', 'Colegios internacionales', 'International schools', 'Internationale Schulen'),
    sub: L('Müfredat, yaş aralığı ve yayımlanmış yıllık ücretler.', 'Currículo, edades y cuotas anuales publicadas.', 'Curriculum, ages and published annual fees.', 'Lehrplan, Alter und veröffentlichte Jahresgebühren.'), hero: null },
};
export const PAGE_ORDER = ['rehber', 'yasam', 'semtler', 'nerede', 'bolgeler', 'aktiviteler', 'okullar'];

export const HUB = {
  yasam: { icon: 'Sun', img: 'altea-street', text: L('Günlük hayat, ulaşım ve güvenlik', 'Vida diaria, transporte y seguridad', 'Daily life, transport and safety', 'Alltag, Verkehr und Sicherheit') },
  semtler: { icon: 'Building2', img: 'alicante', text: L('Valencia ve Alicante: fiyat ve kira', 'Valencia y Alicante: precio y alquiler', 'Valencia and Alicante: price and rent', 'Valencia und Alicante: Preis und Miete') },
  nerede: { icon: 'Compass', img: 'v-artes2', text: L('Ruzafa, El Carmen, Gran Vía, Santa Cruz…', 'Ruzafa, El Carmen, Gran Vía, Santa Cruz…', 'Ruzafa, El Carmen, Gran Vía, Santa Cruz…', 'Ruzafa, El Carmen, Gran Vía, Santa Cruz…') },
  bolgeler: { icon: 'Waves', img: 'calpe-bay', text: L('Altea, Calpe, Benidorm, Jávea…', 'Altea, Calpe, Benidorm, Jávea…', 'Altea, Calpe, Benidorm, Jávea…', 'Altea, Calpe, Benidorm, Jávea…') },
  aktiviteler: { icon: 'PartyPopper', img: 'calpe-stairs', text: L('Festivaller, doğa, deniz', 'Fiestas, naturaleza, mar', 'Festivals, nature, sea', 'Feste, Natur, Meer') },
  okullar: { icon: 'GraduationCap', img: null, text: L('Uluslararası okullar ve ücretler', 'Colegios internacionales y cuotas', 'International schools and fees', 'Internationale Schulen und Gebühren') },
};

export const STR = {
  scroll: L('Kaydırın', 'Desliza', 'Swipe', 'Wischen'),
  stats: {
    vcity: L('Valencia ortalama', 'Media Valencia', 'Valencia average', 'Valencia Durchschnitt'),
    acity: L('Alicante ortalama', 'Media Alicante', 'Alicante average', 'Alicante Durchschnitt'),
    air: L('Valencia havalimanı–merkez (metro)', 'Aeropuerto de Valencia–centro (metro)', 'Valencia airport to centre (metro)', 'Flughafen Valencia–Zentrum (Metro)'),
    between: L('İki şehir arası', 'Entre las dos ciudades', 'Between the two cities', 'Zwischen den beiden Städten'),
    tram: L('Alicante merkez–Playa de San Juan (TRAM)', 'Centro de Alicante–Playa de San Juan (TRAM)', 'Alicante centre to Playa de San Juan (TRAM)', 'Alicante Zentrum–Playa de San Juan (TRAM)'),
  },
  units: { min: L('dk', 'min', 'min', 'Min'), hours: L('saat', 'h', 'h', 'Std') },
  compare: {
    title: L('Valencia ve Alicante bir bakışta', 'Valencia y Alicante de un vistazo', 'Valencia and Alicante at a glance', 'Valencia und Alicante im Überblick'),
    rows: [
      ['Building2', L('Ölçek', 'Tamaño', 'Scale', 'Größe'), L('İspanya’nın 3. büyük şehri', '3.ª ciudad de España', 'Spain’s third-largest city', 'Spaniens drittgrößte Stadt'), L('Yaklaşık 340 bin nüfus, daha küçük', 'Unos 340.000 habitantes, más pequeña', 'About 340,000 people, smaller', 'Rund 340.000 Einwohner, kleiner')],
      ['TrainFront', L('Toplu taşıma', 'Transporte', 'Transport', 'Nahverkehr'), L('Metro, tramvay, EMT otobüs, tek kart (SUMA)', 'Metro, tranvía, EMT, una sola tarjeta (SUMA)', 'Metro, tram, EMT buses, one card (SUMA)', 'Metro, Tram, EMT-Busse, eine Karte (SUMA)'), L('TRAM: Playa de San Juan, El Campello, Benidorm, Dénia', 'TRAM: Playa de San Juan, El Campello, Benidorm, Dénia', 'TRAM: Playa de San Juan, El Campello, Benidorm, Dénia', 'TRAM: Playa de San Juan, El Campello, Benidorm, Dénia')],
      ['Plane', L('Havalimanı', 'Aeropuerto', 'Airport', 'Flughafen'), L('Metro ile yaklaşık 25 dk', 'Unos 25 min en metro', 'About 25 min by metro', 'Etwa 25 Min per Metro'), L('Şehre çok yakın', 'Muy cerca de la ciudad', 'Very close to the city', 'Sehr nah an der Stadt')],
      ['Umbrella', L('Deniz', 'Mar', 'Beach', 'Strand'), L('Cabanyal ve Patacona, yürüyerek', 'Cabanyal y Patacona, a pie', 'Cabanyal and Patacona, on foot', 'Cabanyal und Patacona, zu Fuß'), L('Playa de San Juan ve Postiguet', 'Playa de San Juan y Postiguet', 'Playa de San Juan and Postiguet', 'Playa de San Juan und Postiguet')],
      ['Sun', L('Hava', 'Clima', 'Climate', 'Klima'), L('Yaz sıcak ve nemli, kış ılık', 'Verano cálido y húmedo, invierno suave', 'Hot, humid summers and mild winters', 'Heiße, feuchte Sommer, milde Winter'), L('Kışın da güneşli, yıl boyu yaşam için gözde', 'Sol también en invierno, ideal todo el año', 'Sunny in winter too, popular year-round', 'Auch im Winter sonnig, beliebt zum Ganzjahreswohnen')],
    ],
  },
  safetyIcons: ['Eye', 'MapPin', 'Waves'],
  sections: { life: L('Nasıl bir yer?', '¿Cómo es vivir aquí?', 'What is it like?', 'Wie ist das Leben?'), transport: L('Ulaşım ve trafik', 'Transporte y tráfico', 'Transport and traffic', 'Verkehr'), safety: L('Güvenlik', 'Seguridad', 'Safety', 'Sicherheit'), tips: L('Kasaba seçerken', 'Al elegir pueblo', 'Choosing a town', 'Bei der Ortswahl'), schoolTips: L('Okul seçerken', 'Al elegir colegio', 'Choosing a school', 'Bei der Schulwahl'), priceChart: L('Metrekare satış fiyatı (€/m²)', 'Precio de venta por m² (€/m²)', 'Sale price per m² (€/m²)', 'Verkaufspreis pro m² (€/m²)'), feeChart: L('Yıllık ücret aralığı (€)', 'Horquilla de cuota anual (€)', 'Annual fee range (€)', 'Jahresgebühr (€)') },
  flood: L('Sel riski', 'Riesgo de inundación', 'Flood risk', 'Hochwasserrisiko'),
};
