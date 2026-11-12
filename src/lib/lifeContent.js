// Members-only "life in Valencia / Alicante" tools: cost of living, a day in each neighbourhood,
// neighbourhood comparison, the Turkish community and the moving roadmap.
// Figures were read from public sources in November 2026 (see LIFE_SOURCES); they are indicative.

const L = (tr, es, en, de) => ({ tr, es, en, de });

// ---------- Cost of living ----------
// Numbeo snapshot of 1 June 2026 (as republished by Expatica, converted to EUR on 12 Nov 2026).
export const PRICES = {
  valencia: {
    milk: 1.15, bread: 1.22, eggs: 2.91, chicken: 7.34, cheese: 10.54, beef: 13.86, rice: 1.66, apples: 2.19, oranges: 1.71,
    bananas: 1.70, potatoes: 1.60, tomatoes: 2.12, onions: 1.63, lettuce: 1.05, water: 0.60,
    dinner2: 63.25, utilities: 150, internet: 35.36, mobile: 15.04, petrol: 1.58, gym: 37.79,
    rent: { c1: 1302, o1: 957, c3: 2034, o3: 1493 }, intlSchool: 9408, preschool: 507,
    numbeo: { single: 769, family: 2692 },
  },
  alicante: {
    milk: 1.10, bread: 1.62, eggs: 3.10, chicken: 9.11, cheese: 17.34, beef: 15.64, rice: 1.51, apples: 2.47, oranges: 1.74,
    bananas: 1.92, potatoes: 1.70, tomatoes: 2.58, onions: 2.05, lettuce: 1.14, water: 0.69,
    dinner2: 57.98, utilities: 137, internet: 27.43, mobile: 17.03, petrol: 1.60, gym: 38.09,
    rent: { c1: 934, o1: 779, c3: 1439, o3: 1305 }, intlSchool: 8849, preschool: 693,
    numbeo: { single: 791, family: 2805 },
  },
};

// Monthly basic basket for one adult (quantities). A child counts as CHILD_SHARE of an adult.
export const BASKET = { milk: 8, bread: 6, eggs: 2, chicken: 2, cheese: 0.5, beef: 1, rice: 1, apples: 2, oranges: 2, bananas: 2, potatoes: 3, tomatoes: 3, onions: 1.5, lettuce: 4, water: 12 };
export const BASKET_EXTRA = 0.6; // everything outside the basic basket: breakfast items, cleaning, drinks, snacks
export const CHILD_SHARE = 0.6;
export const TRANSIT_PASS = 35; // Valencia SUMA Mensual 1 zone (2026) and Alicante Móbilis Mensual (from 1 Oct 2026); under 14 ride free
export const HEALTH = { adult: 60, child: 40 }; // private health insurance without co-pay; family of 2+2 averages about 200 €/month
export const CAR_KM = 800; export const CAR_L100 = 6.5;

export const HOUSEHOLDS = [
  { id: 'single', adults: 1, kids: 0, util: 0.8 },
  { id: 'couple', adults: 2, kids: 0, util: 1 },
  { id: 'family1', adults: 2, kids: 1, util: 1.1 },
  { id: 'family2', adults: 2, kids: 2, util: 1.2 },
];

// ---------- A day in the neighbourhood + comparison (ids match AREAS in areaContent.js) ----------
// Scores 1-3 are Lock & Loft's own assessment. sea: how you reach the beach.
export const AREA_LIFE = {
  ruzafa: {
    sea: L('Otobüs veya bisikletle ~20 dk', 'Bus o bici, ~20 min', 'Bus or bike, ~20 min', 'Bus oder Rad, ~20 Min'),
    transit: L('Metro Xàtiva ve Colón yürüme mesafesinde', 'Metro Xàtiva y Colón a pie', 'Xàtiva and Colón metro on foot', 'Metro Xàtiva und Colón zu Fuß'),
    noise: 3, family: 1, night: 3,
    day: [
      L('Sabah Ruzafa Pazarı’nda (Mercado de Ruzafa) taze meyve ve balık; ardından köşedeki kafelerden birinde kahvaltı.', 'Por la mañana, fruta y pescado en el Mercado de Ruzafa; después, desayuno en uno de los cafés de la esquina.', 'Morning: fruit and fish at Ruzafa Market, then breakfast at one of the corner cafés.', 'Morgens Obst und Fisch auf dem Mercado de Ruzafa, danach Frühstück in einem der Eckcafés.'),
      L('Gün içinde her şey yürüme mesafesinde: eczane, market, kuaför, ortak çalışma alanları. Araba çoğu zaman gereksiz.', 'Durante el día, todo a pie: farmacia, súper, peluquería, coworkings. El coche casi sobra.', 'During the day everything is walkable: pharmacy, supermarket, hairdresser, coworking. A car is mostly unnecessary.', 'Tagsüber alles zu Fuß: Apotheke, Supermarkt, Friseur, Coworking. Ein Auto braucht man kaum.'),
      L('Akşam sokaklar dolar; restoranlar ve barlar gece yarısını geçer. Hafta sonu sokağa bakan dairelerde ses olur.', 'Por la tarde las calles se llenan; restaurantes y bares pasan de medianoche. El fin de semana, ruido en los pisos a la calle.', 'In the evening the streets fill up and bars run past midnight. Street-facing flats get noise at weekends.', 'Abends sind die Straßen voll, Bars öffnen bis nach Mitternacht. In Wohnungen zur Straße ist es am Wochenende laut.'),
    ],
    fit: L('Genç çiftler, uzaktan çalışanlar, şehir hayatı sevenler.', 'Parejas jóvenes, teletrabajadores y amantes de la vida urbana.', 'Young couples, remote workers, city lovers.', 'Junge Paare, Remote-Arbeitende, Stadtmenschen.'),
  },
  eixample: {
    sea: L('Otobüsle ~25 dk', 'Bus, ~25 min', 'Bus, ~25 min', 'Bus, ~25 Min'),
    transit: L('Metro Colón (3, 5, 9) ve çok sayıda otobüs hattı', 'Metro Colón (3, 5, 9) y muchas líneas de bus', 'Colón metro (3, 5, 9) and many bus lines', 'Metro Colón (3, 5, 9) und viele Buslinien'),
    noise: 2, family: 2, night: 2,
    day: [
      L('Sabah kahvesi modernist Colón Pazarı’nda (Mercado de Colón); sonra Turia Parkı’nda koşu veya yürüyüş.', 'Café en el modernista Mercado de Colón y después carrera o paseo por el Jardín del Turia.', 'Coffee at the modernist Colón Market, then a run or walk in the Turia gardens.', 'Kaffee in der Jugendstil-Markthalle Mercado de Colón, danach Joggen oder Spazieren im Turia-Park.'),
      L('Colón ve Jorge Juan caddelerinde mağazalar, El Corte Inglés, bankalar ve noterler. İşler yürüyerek halledilir.', 'Tiendas en Colón y Jorge Juan, El Corte Inglés, bancos y notarías. Las gestiones se hacen a pie.', 'Shops on Colón and Jorge Juan, El Corte Inglés, banks and notaries. Errands are done on foot.', 'Geschäfte in Colón und Jorge Juan, El Corte Inglés, Banken und Notare. Erledigungen zu Fuß.'),
      L('Akşam şık restoranlar ve teraslar; Ruzafa kadar gürültülü değil. Otopark pahalı ve az.', 'Por la noche, restaurantes y terrazas elegantes; menos ruido que Ruzafa. Aparcar es caro y difícil.', 'Evenings bring smart restaurants and terraces, quieter than Ruzafa. Parking is scarce and expensive.', 'Abends elegante Restaurants und Terrassen, ruhiger als Ruzafa. Parken ist knapp und teuer.'),
    ],
    fit: L('Merkezde prestijli bir adres isteyenler, kiraya vermeyi düşünenler.', 'Quien busca una dirección céntrica y de prestigio, o alquilar.', 'Those wanting a prestigious central address, or to rent out.', 'Wer eine zentrale Top-Adresse sucht oder vermieten will.'),
  },
  poblats: {
    sea: L('Yürüyerek 5-10 dk', 'A pie, 5-10 min', 'On foot, 5-10 min', 'Zu Fuß, 5-10 Min'),
    transit: L('Tramvay 4, 6, 8 ve metro 5 (Marítim); merkeze ~20 dk', 'Tranvía 4, 6, 8 y metro 5 (Marítim); ~20 min al centro', 'Tram 4, 6, 8 and metro 5 (Marítim); ~20 min to the centre', 'Tram 4, 6, 8 und Metro 5 (Marítim); ~20 Min ins Zentrum'),
    noise: 2, family: 2, night: 2,
    day: [
      L('Sabah sahilde yürüyüş veya yüzme (Las Arenas ve Malvarrosa); ardından Cabanyal Pazarı.', 'Por la mañana, paseo o baño en la playa (Las Arenas y Malvarrosa) y luego el Mercado del Cabanyal.', 'Morning walk or swim on the beach (Las Arenas, Malvarrosa), then Cabanyal Market.', 'Morgens Strandspaziergang oder Schwimmen (Las Arenas, Malvarrosa), danach der Markt im Cabanyal.'),
      L('Çinili eski balıkçı evleri ile yenilenmiş binalar yan yana. Sokak sokak fark gösterir; yerinde görmeden karar vermeyin.', 'Casas de pescadores con azulejos junto a edificios reformados. Cambia calle a calle; no decidas sin verlo.', 'Tiled fishermen’s houses sit beside renovated blocks. It changes street by street; do not decide without seeing it.', 'Gekachelte Fischerhäuser neben sanierten Bauten. Es ändert sich von Straße zu Straße; nicht ohne Besichtigung entscheiden.'),
      L('Akşam sahil yolunda paella ve deniz ürünleri restoranları. Yazın kalabalık, kışın sakin.', 'Por la noche, arroces y marisco en el paseo marítimo. Lleno en verano, tranquilo en invierno.', 'Evenings: paella and seafood on the promenade. Busy in summer, calm in winter.', 'Abends Paella und Meeresfrüchte an der Promenade. Im Sommer voll, im Winter ruhig.'),
    ],
    fit: L('Denize yürümek isteyenler, karakterli bina arayanlar, yatırımcılar.', 'Quien quiere ir andando al mar, edificios con carácter, inversores.', 'People who want to walk to the sea, buildings with character, investors.', 'Wer zu Fuß ans Meer will, Gebäude mit Charakter, Anleger.'),
  },
  benimaclet: {
    sea: L('Bisikletle ~15 dk', 'Bici, ~15 min', 'Bike, ~15 min', 'Rad, ~15 Min'),
    transit: L('Metro 3, 9 ve tramvay 4, 6 (Benimaclet); üniversiteler yakın', 'Metro 3, 9 y tranvía 4, 6 (Benimaclet); universidades cerca', 'Metro 3, 9 and tram 4, 6 (Benimaclet); universities nearby', 'Metro 3, 9 und Tram 4, 6 (Benimaclet); Unis in der Nähe'),
    noise: 2, family: 2, night: 2,
    day: [
      L('Köy meydanı havasında bir merkez: sabah fırın ve meydanda kahve.', 'Un centro con aire de pueblo: panadería por la mañana y café en la plaza.', 'A village-square centre: bakery in the morning and coffee on the square.', 'Ein Zentrum mit Dorfplatz-Flair: morgens Bäckerei und Kaffee auf dem Platz.'),
      L('Öğrenci ve akademisyen nüfusu yüksek; küçük esnaf, kitapçılar, uygun fiyatlı lokantalar. Kenarında bostanlar (huerta) başlar.', 'Mucho estudiante y profesorado; comercio pequeño, librerías y comidas asequibles. En el borde empieza la huerta.', 'Lots of students and academics; small shops, bookshops, affordable eateries. The huerta (market gardens) starts at its edge.', 'Viele Studierende und Lehrende; kleine Läden, Buchhandlungen, günstige Lokale. Am Rand beginnt die Huerta.'),
      L('Akşam sakin barlar ve konserler; hafta sonu bostan yolundan bisikletle Alboraya ve sahile.', 'Por la noche, bares tranquilos y conciertos; el fin de semana, en bici por la huerta hasta Alboraya y la playa.', 'Quiet bars and gigs in the evening; at weekends cycle through the huerta to Alboraya and the beach.', 'Abends ruhige Bars und Konzerte; am Wochenende mit dem Rad durch die Huerta nach Alboraya und zum Strand.'),
    ],
    fit: L('Bütçesine dikkat eden aileler, öğrenci kiralamayı düşünenler.', 'Familias con presupuesto ajustado y quien piensa en alquilar a estudiantes.', 'Budget-minded families and anyone thinking of renting to students.', 'Preisbewusste Familien und wer an Studierende vermieten will.'),
  },
  campanar: {
    sea: L('Metro ve tramvayla ~35 dk', 'Metro y tranvía, ~35 min', 'Metro plus tram, ~35 min', 'Metro und Tram, ~35 Min'),
    transit: L('Metro Campanar (1, 2); şehir dışı yollara hızlı çıkış', 'Metro Campanar (1, 2); salida rápida a las autovías', 'Campanar metro (1, 2); quick access to the motorways', 'Metro Campanar (1, 2); schneller Zugang zu Autobahnen'),
    noise: 1, family: 3, night: 1,
    day: [
      L('Sabah çocukları okula bırakıp Turia Parkı’nın batı ucunda yürüyüş; Bioparc ve Cabecera Parkı yakın.', 'Por la mañana, cole y paseo por el extremo oeste del Turia; Bioparc y Parque de Cabecera cerca.', 'Morning school run, then a walk at the west end of the Turia gardens; Bioparc and Cabecera Park nearby.', 'Morgens zur Schule, dann Spaziergang am Westende des Turia-Parks; Bioparc und Parque de Cabecera in der Nähe.'),
      L('Yeni siteler, havuzlu ortak alanlar ve kapalı otopark yaygın. Nuevo Centro alışveriş merkezi ve büyük marketler.', 'Urbanizaciones nuevas con piscina y garaje. Centro comercial Nuevo Centro y grandes supermercados.', 'New complexes with shared pools and garages. Nuevo Centro shopping centre and big supermarkets.', 'Neue Anlagen mit Pool und Tiefgarage. Einkaufszentrum Nuevo Centro und große Supermärkte.'),
      L('Akşam sakin; aile restoranları ve parklar. Gece hayatı için merkeze gidilir.', 'Tardes tranquilas: restaurantes familiares y parques. Para salir de noche, al centro.', 'Calm evenings: family restaurants and parks. Go to the centre for nightlife.', 'Ruhige Abende: Familienrestaurants und Parks. Zum Ausgehen ins Zentrum.'),
    ],
    fit: L('Çocuklu aileler, yeni bina ve otopark isteyenler.', 'Familias con niños y quien quiere obra nueva y garaje.', 'Families with children, people wanting new builds and parking.', 'Familien mit Kindern, wer Neubau und Parkplatz will.'),
  },
  'san-juan': {
    sea: L('Yürüyerek, kumsal kapıda', 'A pie, la playa en la puerta', 'On foot, the beach is on your doorstep', 'Zu Fuß, der Strand vor der Tür'),
    transit: L('TRAM ile merkeze ~15-20 dk', 'TRAM al centro, ~15-20 min', 'TRAM to the centre, ~15-20 min', 'TRAM ins Zentrum, ~15-20 Min'),
    noise: 1, family: 3, night: 2,
    day: [
      L('Sabah kilometrelerce uzanan kumsalda yürüyüş veya bisiklet; yıl boyu açık kafeler.', 'Por la mañana, paseo o bici por una playa de kilómetros; cafés abiertos todo el año.', 'Morning walk or bike ride along kilometres of beach; cafés open year-round.', 'Morgens Spaziergang oder Radtour am kilometerlangen Strand; ganzjährig geöffnete Cafés.'),
      L('Geniş caddeler, modern siteler, büyük marketler. Uluslararası okullara arabayla kısa mesafe; golf sahası yakın.', 'Avenidas anchas, residenciales modernos y grandes súper. Colegios internacionales a poca distancia en coche; campo de golf cerca.', 'Wide avenues, modern complexes, big supermarkets. International schools a short drive away; a golf course nearby.', 'Breite Straßen, moderne Anlagen, große Supermärkte. Internationale Schulen nah mit dem Auto; Golfplatz in der Nähe.'),
      L('Yaz akşamları sahil restoranları dolu; kışın sakin ve yerleşik bir mahalle havası.', 'En verano, restaurantes de playa llenos; en invierno, ambiente tranquilo de barrio residencial.', 'Summer evenings fill the beach restaurants; winter feels calm and residential.', 'Im Sommer volle Strandrestaurants; im Winter ruhig und wohnlich.'),
    ],
    fit: L('Aileler, yıl boyu denize yakın yaşamak isteyenler, emekliler.', 'Familias, quien quiere vivir junto al mar todo el año y jubilados.', 'Families, year-round seaside living, retirees.', 'Familien, ganzjähriges Leben am Meer, Ruheständler.'),
  },
  centro: {
    sea: L('Yürüyerek, Postiguet plajı', 'A pie, playa del Postiguet', 'On foot, Postiguet beach', 'Zu Fuß, Postiguet-Strand'),
    transit: L('TRAM Luceros ve Mercado; tren istasyonu yakın', 'TRAM Luceros y Mercado; estación de tren cerca', 'TRAM Luceros and Mercado; train station nearby', 'TRAM Luceros und Mercado; Bahnhof in der Nähe'),
    noise: 3, family: 2, night: 3,
    day: [
      L('Sabah Merkez Pazarı’nda (Mercado Central) alışveriş, Explanada’da kahve ve Postiguet’te deniz.', 'Compra en el Mercado Central, café en la Explanada y baño en el Postiguet.', 'Shopping at the Central Market, coffee on the Explanada, a swim at Postiguet.', 'Einkauf in der Markthalle, Kaffee an der Explanada, Baden am Postiguet.'),
      L('Bankalar, resmi daireler, mağazalar ve marina yürüme mesafesinde. Santa Bárbara Kalesi şehrin üstünde.', 'Bancos, organismos, tiendas y puerto deportivo a pie. El Castillo de Santa Bárbara sobre la ciudad.', 'Banks, public offices, shops and the marina on foot. Santa Bárbara Castle above the city.', 'Banken, Ämter, Geschäfte und Jachthafen zu Fuß. Die Burg Santa Bárbara über der Stadt.'),
      L('Akşam eski şehirde (El Barrio) tapas ve barlar. Haziran’da Hogueras festivali boyunca gece gündüz hareketli.', 'Por la noche, tapas y bares en El Barrio. En junio, durante las Hogueras, ambiente día y noche.', 'Evenings: tapas and bars in the old quarter (El Barrio). In June the Hogueras festival runs day and night.', 'Abends Tapas und Bars in der Altstadt (El Barrio). Im Juni ist während der Hogueras Tag und Nacht etwas los.'),
    ],
    fit: L('Arabasız yaşamak isteyenler, kısa dönem kiralama düşünenler.', 'Quien quiere vivir sin coche o piensa en alquiler vacacional.', 'People who want to live car-free or consider short lets.', 'Wer ohne Auto leben will oder an Ferienvermietung denkt.'),
  },
  'san-blas': {
    sea: L('Otobüsle ~20 dk', 'Bus, ~20 min', 'Bus, ~20 min', 'Bus, ~20 Min'),
    transit: L('Alicante tren istasyonuna ve merkeze otobüsle kısa mesafe', 'Cerca de la estación de tren y del centro en bus', 'Short bus ride to the train station and the centre', 'Kurze Busfahrt zum Bahnhof und ins Zentrum'),
    noise: 2, family: 3, night: 1,
    day: [
      L('Sabah mahalle fırını ve yerel market; turistten çok yerli halk.', 'Panadería de barrio y súper local por la mañana; más vecinos que turistas.', 'Neighbourhood bakery and local shop in the morning; more locals than tourists.', 'Morgens Bäckerei und Laden im Viertel; mehr Einheimische als Touristen.'),
      L('Yeni yapılaşma alanlarında (PAU) havuzlu siteler; eski kısımda uygun fiyatlı daireler.', 'Residenciales con piscina en las zonas nuevas (PAU); pisos asequibles en la parte antigua.', 'Complexes with pools in the newer PAU areas; affordable flats in the older part.', 'Anlagen mit Pool in den neuen PAU-Gebieten; günstige Wohnungen im älteren Teil.'),
      L('Akşam sakin; parklar ve mahalle lokantaları. Merkeze ve deniz kıyısına gitmek için otobüs veya araba gerekir.', 'Tardes tranquilas, parques y bares de barrio. Para el centro o la playa, bus o coche.', 'Calm evenings, parks and neighbourhood bars. Bus or car for the centre and the beach.', 'Ruhige Abende, Parks und Kneipen. Für Zentrum und Strand Bus oder Auto.'),
    ],
    fit: L('Bütçe dostu aile evi arayanlar.', 'Quien busca vivienda familiar económica.', 'Those after an affordable family home.', 'Wer ein bezahlbares Familienheim sucht.'),
  },
};

// ---------- Turkish community ----------
// Places checked in public listings in November 2026. Opening hours change; check before going.
export const COMMUNITY = [
  { city: 'valencia', type: 'food', name: 'Ninda', addr: 'C. del Reverend Rafael Tramoyeres, 11, 46020 València',
    t: L('Meze ve ana yemekleriyle oturmalı Türk mutfağı; imam bayıldı ve baklava öne çıkıyor.', 'Cocina turca de mesa con mezes y platos principales; destacan el imam bayıldı y el baklava.', 'Sit-down Turkish cuisine with mezes and mains; imam bayıldı and baklava stand out.', 'Türkische Küche zum Sitzen mit Meze und Hauptgerichten; Imam Bayıldı und Baklava sind beliebt.') },
  { city: 'valencia', type: 'food', name: 'Sofra', addr: 'Av. de Blasco Ibáñez, 110, 46021 València',
    t: L('Pide ve Adana kebap için müdavimleri olan bir yer; üniversite bölgesinde.', 'Pide y kebab Adana con clientela fiel; en la zona universitaria.', 'Pide and Adana kebab with a loyal following; in the university area.', 'Pide und Adana-Kebab mit Stammkundschaft; im Uni-Viertel.') },
  { city: 'valencia', type: 'food', name: 'Destina Bar Restaurante', addr: 'Plaça del Doctor Berenguer Ferrer, 9, 46014 València',
    t: L('Türklerin işlettiği mahalle lokantası: menemen, Türk kahvesi, ayran ve tatlı.', 'Bar de barrio llevado por turcos: menemen, café turco, ayran y postres.', 'A Turkish-run neighbourhood spot: menemen, Turkish coffee, ayran and desserts.', 'Von Türken geführtes Nachbarschaftslokal: Menemen, türkischer Kaffee, Ayran und Desserts.') },
  { city: 'valencia', type: 'food', name: 'Kebap Bolsería', addr: 'C. de la Bolseria, 37, 46001 València',
    t: L('Eski şehirde, ev yapımı soslarıyla bilinen Türk kebapçısı.', 'Kebab turco en el casco antiguo, conocido por sus salsas caseras.', 'A Turkish kebab shop in the old town, known for homemade sauces.', 'Türkischer Kebab in der Altstadt, bekannt für hausgemachte Soßen.') },
  { city: 'valencia', type: 'shop', name: 'Afandi Delicias del Sultán', addr: 'Mercado Central, Plaça de la Ciutat de Bruges, 46001 València',
    t: L('Merkez Pazarı’nda tezgâh: dolma, humus, muhammara, zeytin ve Türk ve Orta Doğu ürünleri.', 'Puesto del Mercado Central: dolma, hummus, muhammara, aceitunas y productos turcos y de Oriente Medio.', 'A Central Market stall: dolma, hummus, muhammara, olives and Turkish and Middle Eastern products.', 'Stand in der Markthalle: Dolma, Hummus, Muhammara, Oliven, türkische und nahöstliche Produkte.') },
  { city: 'valencia', type: 'shop', name: 'Halal Butcher & Groceries', addr: 'C. del Clariano, 6, València',
    t: L('Helal et ve bakkal ürünleri satan kasap.', 'Carnicería halal con productos de alimentación.', 'Halal butcher with grocery items.', 'Halal-Metzgerei mit Lebensmitteln.') },
  { city: 'valencia', type: 'faith', name: 'Centro Cultural Islámico de Valencia', addr: 'C. de l’Arquitecte Rodríguez, 21, 46019 València',
    t: L('Valencia’nın büyük camisi ve İslam kültür merkezi; cuma namazı ve bayram namazları.', 'Mezquita grande y centro cultural islámico de Valencia; oración del viernes y de las fiestas.', 'Valencia’s main mosque and Islamic cultural centre; Friday and Eid prayers.', 'Die große Moschee und das islamische Kulturzentrum Valencias; Freitags- und Festgebete.') },
  { city: 'alicante', type: 'food', name: 'El Sultan', addr: 'Av. Doctor Gadea, 11, 03003 Alicante',
    t: L('Şehir merkezinde terası olan Türk restoranı; aileler sık gelir.', 'Restaurante turco con terraza en pleno centro; muy familiar.', 'A Turkish restaurant with a terrace in the centre; popular with families.', 'Türkisches Restaurant mit Terrasse im Zentrum; beliebt bei Familien.') },
  { city: 'alicante', type: 'food', name: 'Otrorollo Kebab', addr: 'C. Virgen de los Desamparados, 4, 03001 Alicante',
    t: L('Alicante’nin en yüksek puanlı Türk kebapçılarından; kişi başı 20 € altı.', 'De los kebabs turcos mejor valorados de Alicante; menos de 20 € por persona.', 'One of Alicante’s best-rated Turkish kebab shops; under €20 a head.', 'Einer der bestbewerteten türkischen Kebabläden Alicantes; unter 20 € pro Person.') },
  { city: 'both', type: 'official', name: 'T.C. Barselona Başkonsolosluğu', addr: 'Passeig de Gràcia, 7, 1ª, 08007 Barcelona',
    t: L('Pasaport, kimlik ve noter işleri için başvuru randevulu. Bilgi hattı +34 933 179 231 (14:00-17:00), acil +34 680 414 283. Valencia ve Benidorm’da fahri konsolosluk da var.', 'Pasaportes, DNI turco y notaría con cita previa. Información +34 933 179 231 (14:00-17:00), urgencias +34 680 414 283. También hay consulados honorarios en Valencia y Benidorm.', 'Passports, ID cards and notarial work by appointment. Information +34 933 179 231 (14:00-17:00), emergency +34 680 414 283. There are also honorary consulates in Valencia and Benidorm.', 'Pässe, Ausweise und Notarielles nach Termin. Info +34 933 179 231 (14:00-17:00), Notfall +34 680 414 283. Honorarkonsulate gibt es zudem in Valencia und Benidorm.') },
];

export const FLIGHTS = [
  { route: 'Valencia (VLC) ⇄ İstanbul (IST)', airline: 'Turkish Airlines', time: '~3 sa 45 dk',
    t: L('Direkt sefer, neredeyse her gün; yazın geniş gövdeli uçakla kapasite artıyor. THY sitesinde gidiş-dönüş fiyatlar yaklaşık 270-300 €’dan başlıyor.', 'Vuelo directo casi diario.', 'Direct, almost daily.', 'Direkt, fast täglich.') },
  { route: 'Alicante (ALC) ⇄ İstanbul (SAW)', airline: 'Pegasus', time: '~3 sa 45 dk',
    t: L('23 Haziran 2026’dan beri haftada 4 gün (salı, perşembe, cumartesi, pazar), yıl boyu. Tek yön 60 €’dan başlayan kampanyalarla açıldı; gidiş-dönüş genelde 190 € civarı.', 'Desde el 23 de junio de 2026, 4 días por semana.', 'Since 23 June 2026, four days a week.', 'Seit 23. Juni 2026 viermal pro Woche.') },
  { route: 'Valencia / Alicante ⇄ Ankara, İzmir, Antalya', airline: 'Turkish Airlines, Pegasus', time: '~6-8 sa',
    t: L('İstanbul aktarmalı; THY’de Valencia-Ankara tek yön yaklaşık 360 €’dan başlıyor.', 'Con escala en Estambul.', 'Via Istanbul.', 'Über Istanbul.') },
];

// ---------- Moving roadmap ----------
// Order matters: each step usually needs the one before it.
export const STEPS = [
  { id: 'visa', icon: 'Stamp',
    title: L('Oturum yolunu seçin', 'Elige la vía de residencia', 'Choose your residence route', 'Den Aufenthaltsweg wählen'),
    what: L('Ev almak tek başına oturum hakkı vermez: altın vize 3 Nisan 2025’te kaldırıldı. Türk vatandaşları için yaygın yollar çalışmadan oturum (non-lucrative), dijital göçebe, çalışma izni ve öğrenci vizesidir.', 'Comprar vivienda no da residencia: la golden visa se eliminó el 3 de abril de 2025. Para ciudadanos de fuera de la UE, las vías habituales son la residencia no lucrativa, nómada digital, permiso de trabajo y estudios.', 'Buying a home does not give residence: the golden visa ended on 3 April 2025. For non-EU citizens the common routes are non-lucrative residence, digital nomad, a work permit and student visas.', 'Ein Immobilienkauf gibt kein Aufenthaltsrecht: Das Golden Visa endete am 3. April 2025. Für Nicht-EU-Bürger sind die üblichen Wege nicht erwerbstätiger Aufenthalt, Digital Nomad, Arbeitserlaubnis und Studium.'),
    where: L('Türkiye’deki İspanya konsolosluğu veya yetkili vize merkezi', 'Consulado de España en tu país o centro de visados autorizado', 'The Spanish consulate in your country or its authorised visa centre', 'Spanisches Konsulat im Heimatland oder das zuständige Visazentrum'),
    time: L('Birkaç hafta - birkaç ay', 'De semanas a meses', 'Weeks to months', 'Wochen bis Monate'),
    tip: L('Non-lucrative vize için yeterli gelir ve İspanya’da geçerli özel sağlık sigortası istenir.', 'La no lucrativa exige medios económicos suficientes y seguro médico privado válido en España.', 'Non-lucrative residence requires sufficient income and private health insurance valid in Spain.', 'Für den nicht erwerbstätigen Aufenthalt braucht man ausreichende Mittel und eine in Spanien gültige private Krankenversicherung.') },
  { id: 'nie', icon: 'IdCard',
    title: L('NIE numarası alın', 'Obtén el NIE', 'Get your NIE number', 'Die NIE beantragen'),
    what: L('Yabancılar için vergi ve kimlik numarası. Tapu, banka hesabı, elektrik-su aboneliği için gerekir.', 'Número de identificación de extranjero. Necesario para escriturar, abrir cuenta y dar de alta suministros.', 'The foreigner identification number. Needed to buy property, open a bank account and connect utilities.', 'Die Ausländer-Identifikationsnummer. Nötig für Kauf, Bankkonto und Versorgerverträge.'),
    where: L('Türkiye’deki İspanya konsolosluğu ya da İspanya’da Policía Nacional (randevu ile, EX-15 formu)', 'Consulado de España en tu país o Policía Nacional en España (cita previa, formulario EX-15)', 'The Spanish consulate in your country, or Policía Nacional in Spain (appointment, form EX-15)', 'Spanisches Konsulat im Heimatland oder Policía Nacional in Spanien (Termin, Formular EX-15)'),
    time: L('Randevuya bağlı; birkaç gün - birkaç hafta', 'Según cita; de días a semanas', 'Depends on appointments; days to weeks', 'Je nach Termin; Tage bis Wochen'),
    cost: L('Harç (790-012): 9,84 €', 'Tasa (790-012): 9,84 €', 'Fee (790-012): €9.84', 'Gebühr (790-012): 9,84 €'),
    tip: L('Ev alacaksanız NIE’yi taşınmadan önce çıkarın; satış süreci hızlanır.', 'Si vas a comprar, saca el NIE antes de mudarte; agiliza la compra.', 'If you are buying, get the NIE before you move; it speeds up the purchase.', 'Wer kauft, sollte die NIE vor dem Umzug haben; das beschleunigt den Kauf.') },
  { id: 'bank', icon: 'Landmark',
    title: L('Banka hesabı açın', 'Abre una cuenta bancaria', 'Open a bank account', 'Ein Bankkonto eröffnen'),
    what: L('Pasaport ve NIE ile yerleşik olmayan (no residente) hesap açılabilir; oturum kartı gelince yerleşik hesaba geçilir. Kira, faturalar ve vergi ödemeleri bu hesaptan yapılır.', 'Con pasaporte y NIE se puede abrir una cuenta de no residente; con la tarjeta de residencia se pasa a residente. Alquiler, recibos e impuestos se pagan desde ella.', 'A non-resident account can be opened with passport and NIE, then switched to resident once you have your card. Rent, bills and taxes are paid from it.', 'Mit Pass und NIE lässt sich ein Nichtansässigen-Konto eröffnen, später wird es umgestellt. Miete, Rechnungen und Steuern laufen darüber.'),
    where: L('Herhangi bir İspanyol bankası şubesi', 'Cualquier oficina bancaria', 'Any Spanish bank branch', 'Jede spanische Bankfiliale'),
    time: L('1-2 hafta', '1-2 semanas', '1-2 weeks', '1-2 Wochen'),
    tip: L('Yerleşik olmayan hesaplarda bakım ücreti daha yüksek olabilir; ücret tablosunu sorun.', 'Las cuentas de no residente pueden tener comisiones más altas; pide las tarifas.', 'Non-resident accounts can carry higher fees; ask for the fee sheet.', 'Nichtansässigen-Konten können teurer sein; nach den Gebühren fragen.') },
  { id: 'padron', icon: 'Home',
    title: L('Ev ve ikamet kaydı (empadronamiento)', 'Vivienda y empadronamiento', 'Home and town-hall registration (padrón)', 'Wohnung und Meldeeintrag (Padrón)'),
    what: L('Belediyeye adresinizi kaydettirirsiniz. Sağlık kartı, okul kaydı ve birçok işlem bu belgeyi ister.', 'Te inscribes en el padrón municipal. Lo piden la tarjeta sanitaria, la escolarización y muchos trámites.', 'You register your address with the town hall. The health card, school places and many other steps ask for it.', 'Man meldet die Adresse bei der Gemeinde an. Gesundheitskarte, Schulplatz und viele Verfahren verlangen es.'),
    where: L('Valencia: Padrón ofisi veya Tabacalera Vatandaş Ofisi (randevu 010). Alicante: belediye vatandaş ofisleri (OAC).', 'Valencia: Oficina del Padrón u OAC Tabacalera (cita 010). Alicante: oficinas de atención ciudadana.', 'Valencia: the Padrón office or the Tabacalera citizen office (appointments on 010). Alicante: citizen service offices (OAC).', 'Valencia: Padrón-Büro oder Bürgerbüro Tabacalera (Termin über 010). Alicante: Bürgerbüros (OAC).'),
    time: L('Aynı gün - birkaç hafta (randevuya bağlı)', 'Mismo día a semanas (según cita)', 'Same day to weeks (depends on appointments)', 'Am selben Tag bis Wochen (je nach Termin)'),
    cost: L('Ücretsiz', 'Gratuito', 'Free', 'Kostenlos'),
    tip: L('Kira sözleşmesi veya tapu ve pasaport götürün. Valencia’da evin kadastro numarası (referencia catastral) da isteniyor.', 'Lleva contrato de alquiler o escritura y pasaporte. En Valencia piden también la referencia catastral.', 'Bring your rental contract or deeds and passport. Valencia also asks for the property’s cadastral reference.', 'Mietvertrag oder Kaufurkunde und Pass mitbringen. Valencia verlangt auch die Katasterreferenz.') },
  { id: 'tie', icon: 'BadgeCheck',
    title: L('Oturum kartı (TIE)', 'Tarjeta de residencia (TIE)', 'Residence card (TIE)', 'Aufenthaltskarte (TIE)'),
    what: L('Vizeyle girdikten sonra ilk ay içinde parmak izi randevusu alıp oturum kartınızı çıkarırsınız.', 'Tras entrar con visado, en el primer mes pides cita de huellas y tramitas la tarjeta.', 'Within the first month after entering on your visa, you book a fingerprint appointment and get the card.', 'Im ersten Monat nach der Einreise mit Visum bucht man einen Fingerabdrucktermin und beantragt die Karte.'),
    where: L('Policía Nacional (randevu ile)', 'Policía Nacional (cita previa)', 'Policía Nacional (by appointment)', 'Policía Nacional (mit Termin)'),
    time: L('Randevu + yaklaşık 1 ay', 'Cita + aprox. 1 mes', 'Appointment plus about a month', 'Termin plus etwa ein Monat'),
    cost: L('İlk kart harcı: 16,08 €', 'Primera tarjeta: 16,08 €', 'First card fee: €16.08', 'Erste Karte: 16,08 €'),
    tip: L('Randevular çabuk doluyor; Valencia’da çevre ilçelerin ofisleri (Torrent, Sagunto) bazen daha boş.', 'Las citas se agotan rápido; las oficinas de Torrent o Sagunto a veces tienen hueco.', 'Appointments go fast; offices in nearby towns such as Torrent or Sagunto sometimes have slots.', 'Termine sind schnell weg; Büros in Torrent oder Sagunto haben manchmal noch Plätze.') },
  { id: 'health', icon: 'HeartPulse',
    title: L('Sağlık kartı (SIP) ve sigorta', 'Tarjeta sanitaria (SIP) y seguro', 'Health card (SIP) and insurance', 'Gesundheitskarte (SIP) und Versicherung'),
    what: L('Valencia bölgesinde kamu sağlığına SIP kartıyla girilir. Şartlar: ikamet kaydı ve sigortalılık (çalışan, emekli veya convenio especial). Non-lucrative vizeyle gelenler özel sigortayı kullanır.', 'En la Comunitat Valenciana la sanidad pública usa la tarjeta SIP. Requisitos: empadronamiento y cobertura (trabajo, pensión o convenio especial). Con residencia no lucrativa se usa el seguro privado.', 'In the Valencia region public healthcare runs on the SIP card. You need the padrón plus cover (employment, pension or a special agreement). Non-lucrative residents use their private insurance.', 'In der Region Valencia läuft die öffentliche Versorgung über die SIP-Karte. Voraussetzung: Padrón und Versicherungsschutz (Arbeit, Rente oder Sondervereinbarung). Nicht Erwerbstätige nutzen die Privatversicherung.'),
    where: L('Bağlı olduğunuz sağlık merkezi (centro de salud)', 'Tu centro de salud', 'Your local health centre (centro de salud)', 'Das zuständige Gesundheitszentrum'),
    time: L('1-3 hafta', '1-3 semanas', '1-3 weeks', '1-3 Wochen'),
    tip: L('Özel sigorta 2+2 aile için ayda ortalama 200 € civarında; katkı paylı (copago) poliçeler daha ucuz.', 'Un seguro privado para familia 2+2 ronda los 200 €/mes de media; con copago es más barato.', 'Private cover for a family of four averages about €200 a month; co-pay policies are cheaper.', 'Private Versicherung für eine vierköpfige Familie kostet im Schnitt etwa 200 €/Monat; mit Zuzahlung günstiger.') },
  { id: 'school', icon: 'GraduationCap',
    title: L('Okul kaydı', 'Escolarización', 'School enrolment', 'Schulanmeldung'),
    what: L('Devlet ve concertada okullara başvuru her bahar çevrimiçi yapılır. Yıl ortasında gelirseniz belediyenin okul yerleştirme komisyonuna (comisión de escolarización) başvurulur. Uluslararası okullara doğrudan başvurulur.', 'La admisión en públicos y concertados es en primavera, en línea. Si llegas a mitad de curso, se pide plaza a la comisión de escolarización municipal. En los internacionales se solicita directamente.', 'Applications for state and concertada schools open online each spring. Arriving mid-year, you apply to the municipal schooling committee. International schools take applications directly.', 'Die Anmeldung für staatliche und konzertierte Schulen läuft jedes Frühjahr online. Bei Ankunft im Schuljahr bewirbt man sich bei der städtischen Schulkommission. Internationale Schulen nehmen direkt Bewerbungen an.'),
    where: L('Generalitat Valenciana eğitim portalı veya belediye eğitim birimi', 'Portal de la Conselleria de Educación o departamento municipal', 'Generalitat education portal or the town hall’s education department', 'Bildungsportal der Generalitat oder das städtische Schulamt'),
    time: L('Yıl ortası kayıt: genelde birkaç hafta', 'A mitad de curso: unas semanas', 'Mid-year places: usually a few weeks', 'Im laufenden Jahr: meist einige Wochen'),
    tip: L('Kamu okullarında İspanyolcanın yanında Valensiyanca da ders olarak var; uluslararası okullar İngilizce ağırlıklı.', 'En la pública se estudia valenciano además de castellano; los internacionales priorizan el inglés.', 'State schools teach Valencian as well as Spanish; international schools focus on English.', 'Staatliche Schulen unterrichten neben Spanisch auch Valencianisch; internationale Schulen setzen auf Englisch.') },
  { id: 'licence', icon: 'Car', trOnly: true,
    title: L('Ehliyet değişimi', 'Canje del permiso de conducir', 'Swap your driving licence', 'Führerschein umschreiben'),
    what: L('Türkiye, İspanya ile ehliyet değişim anlaşması olan ülkeler arasında. Oturum aldıktan sonra Türk ehliyetinizi İspanyol ehliyetiyle değiştirebilirsiniz; başvuru DGT’nin dijital sisteminden başlar.', 'Turquía tiene convenio de canje con España. Una vez residente, puedes canjear el permiso turco por uno español; la solicitud empieza en la sede digital de la DGT.', 'Türkiye has a licence-exchange agreement with Spain. Once resident, you can swap your Turkish licence for a Spanish one; the request starts on the DGT’s online service.', 'Die Türkei hat ein Umtauschabkommen mit Spanien. Als Ansässiger kann man den türkischen Führerschein umtauschen; der Antrag beginnt online bei der DGT.'),
    where: L('DGT e-başvuru, sonra il trafik müdürlüğü (Jefatura) orijinal ehliyeti teslim için', 'Sede electrónica de la DGT y luego la Jefatura para entregar el original', 'DGT online, then the provincial traffic office to hand in the original', 'DGT online, danach die Verkehrsbehörde zur Abgabe des Originals'),
    time: L('Birkaç hafta', 'Unas semanas', 'A few weeks', 'Einige Wochen'),
    tip: L('Değişim yalnızca İspanya’da yerleşik olmadan önce alınmış ehliyetler için geçerli.', 'Solo es canjeable el permiso obtenido antes de ser residente en España.', 'Only a licence obtained before you became resident in Spain can be swapped.', 'Umtauschbar ist nur ein Führerschein, der vor dem Wohnsitz in Spanien erworben wurde.') },
  { id: 'car', icon: 'Truck', trOnly: true,
    title: L('Araç: getirmek mi, burada almak mı?', 'Coche: ¿traerlo o comprar aquí?', 'Car: bring it or buy here?', 'Auto: mitbringen oder hier kaufen?'),
    what: L('Türkiye’den araç getirmek gümrük vergisi (genelde %10), %21 KDV ve tescil vergisi demektir. İkamet değişikliği muafiyeti (traslado de residencia) bazı şartlarla bu vergileri kaldırır; yine de muayene (ITV) ve tescil masrafı kalır.', 'Traer un coche desde Turquía supone arancel (normalmente 10 %), 21 % de IVA e impuesto de matriculación. La franquicia por traslado de residencia puede eximir con condiciones; quedan ITV y matriculación.', 'Bringing a car from Türkiye means customs duty (usually 10%), 21% VAT and registration tax. The change-of-residence relief can waive these under conditions; ITV inspection and registration costs remain.', 'Ein Auto aus der Türkei bedeutet Zoll (meist 10 %), 21 % MwSt. und Zulassungssteuer. Die Umzugsbefreiung kann das unter Bedingungen erlassen; TÜV (ITV) und Zulassung bleiben.'),
    where: L('Gümrük (Aduanas), ITV istasyonu, DGT', 'Aduanas, estación ITV y DGT', 'Customs, an ITV station and the DGT', 'Zoll, ITV-Station und DGT'),
    time: L('1-2 ay', '1-2 meses', '1-2 months', '1-2 Monate'),
    tip: L('Çoğu aile için İspanya’da araç almak daha basit ve ucuz çıkıyor; karar vermeden önce gestor’a sorun.', 'Para la mayoría de familias es más simple y barato comprar aquí; consulta a un gestor antes.', 'For most families buying in Spain is simpler and cheaper; ask a gestor before deciding.', 'Für die meisten Familien ist der Kauf in Spanien einfacher und günstiger; vorher einen Gestor fragen.') },
  { id: 'tax', icon: 'Receipt',
    title: L('Vergi yerleşikliği', 'Residencia fiscal', 'Tax residence', 'Steuerliche Ansässigkeit'),
    what: L('Yılda 183 günden fazla İspanya’da kalırsanız vergi açısından yerleşik sayılırsınız ve dünya gelirinizi beyan edersiniz. Türkiye ile çifte vergilendirmeyi önleme anlaşması var. Yurt dışındaki 50.000 € üzeri varlıklar için ayrıca bildirim (Modelo 720) gerekir.', 'Con más de 183 días al año en España eres residente fiscal y declaras la renta mundial. Conviene revisar el convenio de doble imposición con tu país. Los bienes en el extranjero de más de 50.000 € se declaran en el Modelo 720.', 'Spend more than 183 days a year in Spain and you are tax resident, declaring worldwide income. Check the double-taxation treaty with your home country. Assets abroad over €50,000 must also be reported (Modelo 720).', 'Wer mehr als 183 Tage im Jahr in Spanien ist, ist steuerlich ansässig und erklärt das Welteinkommen. Prüfen Sie das Doppelbesteuerungsabkommen mit Ihrem Heimatland. Auslandsvermögen über 50.000 € muss gemeldet werden (Modelo 720).'),
    where: L('Agencia Tributaria; bir vergi danışmanıyla', 'Agencia Tributaria, con un asesor fiscal', 'Agencia Tributaria, with a tax adviser', 'Agencia Tributaria, mit Steuerberater'),
    time: L('Her yıl nisan-haziran beyan dönemi', 'Cada año, campaña de abril a junio', 'Each year, April-June filing season', 'Jährlich, Erklärungszeitraum April bis Juni'),
    tip: L('Taşınma tarihini vergi danışmanıyla birlikte planlayın; yıl ortası taşınma iki ülkede de beyan doğurabilir.', 'Planifica la fecha de mudanza con un asesor; mudarse a mitad de año puede generar declaración en ambos países.', 'Plan your moving date with an adviser; a mid-year move can create filings in both countries.', 'Den Umzugstermin mit einem Berater planen; ein Umzug zur Jahresmitte kann Erklärungen in beiden Ländern auslösen.') },
];

export const LIFE_SOURCES = [
  ['Numbeo vía Expatica (Valencia)', 'https://www.expatica.com/es/cost-of-living/valencia/'],
  ['Numbeo vía Expatica (Alicante)', 'https://www.expatica.com/es/cost-of-living/alicante/'],
  ['Tarifas SUMA 2026', 'https://www.redtransporte.com/valencia/precios-abonos.html'],
  ['Ayuntamiento de Alicante (Móbilis)', 'https://www.alicante.es/es/noticias/alicante-estrena-bonos-mobilis-y-mobilis-jove-viajes-mensuales-ilimitados'],
  ['Seguro de salud familiar 2026', 'https://cuantomecuesta.com/es/seguro-salud-familia/'],
  ['La Moncloa (fin golden visa)', 'https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/vivienda-agenda-urbana/Paginas/2025/020425-fin-golden-visa.aspx'],
  ['Tasa 790-012 (2026)', 'https://taxdown.es/extranjeros/tasa-790-012-que-es-como-rellenar-precio'],
  ['Ayuntamiento de València (Padrón)', 'https://www.valencia.es/es/-/infociudad-oficina-del-padr%C3%93n-municipal'],
  ['DGT (canje Turquía)', 'https://sede.dgt.gob.es/es/permisos-de-conducir/canjes-de-permisos/canjes-de-permisos-extranjeros/extracomunitarios/canje-paises-G4-CL-CP/index.html', 'tr'],
  ['AEAT (traslado de residencia)', 'https://sede.agenciatributaria.gob.es/static_files/AEAT_Intranet/Aduanas/Normativa/notas_inf/Ni_08_2026.pdf', 'tr'],
  ['Aena (ALC-SAW)', 'https://www.aena.es/doc/detalleprensa/260623-ft-alc-nueva-ruta-alc-saw.pdf', 'tr'],
  ['T.C. Barselona Başkonsolosluğu', 'https://barselona-bk.mfa.gov.tr/', 'tr'],
  ['GastroRanking', 'https://gastroranking.es/restaurantes/turca/valencia/', 'tr'],
];

const UI = {
  tr: {
    cost: {
      title: 'Aylık yaşam maliyetinizi hesaplayın', intro: 'Hane tipini ve yaşam tarzınızı seçin; tutarlar Valencia veya Alicante’nin güncel fiyatlarıyla hesaplanır.',
      city: 'Şehir', household: 'Hane', households: { single: 'Tek kişi', couple: 'Çift', family1: 'Çift + 1 çocuk', family2: 'Çift + 2 çocuk' },
      housing: 'Konut', housings: { own: 'Ev sahibiyim', rent: 'Kiradayım' }, price: 'Evin fiyatı (€)', rentSize: 'Kiralık daire', rents: { c1: '1+1, merkez', o1: '1+1, merkez dışı', c3: '3+1, merkez', o3: '3+1, merkez dışı' },
      school: 'Okul', schools: { public: 'Devlet okulu', intl: 'Uluslararası okul' }, health: 'Sağlık', healths: { public: 'Kamu (SIP)', private: 'Özel sigorta' },
      car: 'Araba kullanıyorum', dinners: 'Ayda kaç kez dışarıda akşam yemeği (2 kişi)', gym: 'Spor salonu üyeliği',
      rows: { market: 'Market alışverişi', dining: 'Dışarıda yemek', utilities: 'Elektrik, su, gaz', telecom: 'İnternet ve cep telefonu', transit: 'Toplu taşıma (aylık kart)', health: 'Özel sağlık sigortası', school: 'Uluslararası okul (aylık)', home: 'Aidat, emlak vergisi (IBI), konut sigortası', rent: 'Kira', car: 'Yakıt (ayda ~800 km)', gym: 'Spor salonu', other: 'Diğer harcamalar' },
      other: 'Kişi başı diğer harcamalar (giyim, eğlence, kişisel bakım)',
      total: 'Aylık toplam', perYear: 'Yıllık', approxTry: 'Yaklaşık TL karşılığı',
      compareTitle: 'Bugünkü harcamanızla kıyaslayın', compareLabel: 'Şu an ayda yaklaşık kaç TL harcıyorsunuz? (kira dahil)', compareMore: (x) => `Valencia/Alicante’de ayda yaklaşık ${x} daha fazla`, compareLess: (x) => `Valencia/Alicante’de ayda yaklaşık ${x} daha az`, compareNoRate: 'Kur alınamadı; daha sonra tekrar deneyin.',
      kidsFree: '14 yaş altı toplu taşıma ücretsiz; 31 yaş altına indirimli kart var.', notes: 'Market tutarı temel bir sepetin güncel fiyatlarıyla ve temel ürünler dışındaki alışveriş için %60 eklenerek hesaplanır. Çocuklar yetişkin tüketiminin %60’ı sayılır. Tutarlar göstergedir.',
      numbeo: (s, f) => `Karşılaştırma: Numbeo’ya göre kira hariç aylık gider tek kişi için ~${s}, 4 kişilik aile için ~${f}.`,
    },
    day: { title: 'Semtte bir gün', intro: 'Bu semtte yaşasaydınız sıradan bir gününüz nasıl geçerdi?', fit: 'Kimlere uygun', sea: 'Deniz', transit: 'Ulaşım' },
    compare: { title: 'Semtleri karşılaştırın', intro: 'İki semt seçin, yan yana görün.', pick: 'Semt seçin', rows: { sale: 'Satış fiyatı', rent: 'Kira', sea: 'Denize ulaşım', transit: 'Ulaşım', noise: 'Gürültü', family: 'Aileye uygunluk', night: 'Gece hayatı' }, levels: ['Düşük', 'Orta', 'Yüksek'], none: 'Veri yok', note: 'Fiyatlar Kasım 2026’da okunan kamuya açık kaynaklardan; gürültü, aile ve gece hayatı puanları Lock & Loft değerlendirmesidir.' },
    community: { title: 'Türk topluluğu ve tanıdık lezzetler', intro: 'Dürüst olalım: Valencia ve Alicante’de büyük bir Türk mahallesi yok, topluluk küçük ve dağınık. Ama tanıdık lezzetlere, helal ürünlere ve resmi işlerinize ulaşmak zor değil.', types: { food: 'Restoran', shop: 'Market ve kasap', faith: 'Cami', official: 'Resmi' }, cities: { valencia: 'Valencia', alicante: 'Alicante', both: 'Tüm bölge' }, map: 'Haritada aç', flights: 'Türkiye’ye direkt uçuşlar', note: 'Yerler Kasım 2026’da kamuya açık listelerden kontrol edildi; açılış saatleri değişebilir, gitmeden önce teyit edin.', ask: 'Türkçe konuşan avukat, gestor veya doktor mu arıyorsunuz? Bize yazın, tanıdığımız kişileri paylaşalım.' },
    steps: { title: 'Taşınma yol haritası', intro: 'Sırayla yapılacak işler. Çoğu adım bir öncekinin belgesini ister.', where: 'Nerede', time: 'Süre', cost: 'Ücret', tip: 'İpucu', note: 'Bu sayfa genel bilgidir, hukuki veya vergi danışmanlığı değildir. Ücretler 2026 itibarıyla geçerlidir.' },
    sourcesTitle: 'Kaynaklar',
  },
  es: {
    cost: {
      title: 'Calcula tu coste de vida mensual', intro: 'Elige tu hogar y estilo de vida; calculamos con los precios actuales de Valencia o Alicante.',
      city: 'Ciudad', household: 'Hogar', households: { single: 'Una persona', couple: 'Pareja', family1: 'Pareja + 1 hijo', family2: 'Pareja + 2 hijos' },
      housing: 'Vivienda', housings: { own: 'Soy propietario', rent: 'Alquilo' }, price: 'Precio de la vivienda (€)', rentSize: 'Piso de alquiler', rents: { c1: '1 hab., centro', o1: '1 hab., fuera del centro', c3: '3 hab., centro', o3: '3 hab., fuera del centro' },
      school: 'Colegio', schools: { public: 'Público', intl: 'Internacional' }, health: 'Sanidad', healths: { public: 'Pública (SIP)', private: 'Seguro privado' },
      car: 'Uso coche', dinners: 'Cenas fuera al mes (2 personas)', gym: 'Gimnasio',
      rows: { market: 'Supermercado', dining: 'Comer fuera', utilities: 'Luz, agua, gas', telecom: 'Internet y móvil', transit: 'Transporte (abono mensual)', health: 'Seguro médico privado', school: 'Colegio internacional (mes)', home: 'Comunidad, IBI y seguro de hogar', rent: 'Alquiler', car: 'Combustible (~800 km/mes)', gym: 'Gimnasio', other: 'Otros gastos' },
      other: 'Otros gastos por persona (ropa, ocio, cuidado personal)',
      total: 'Total mensual', perYear: 'Al año', approxTry: 'Equivalente aproximado en TRY',
      compareTitle: 'Compara con tu gasto actual', compareLabel: '¿Cuántas liras gastas al mes ahora? (alquiler incluido)', compareMore: (x) => `En Valencia/Alicante, unos ${x} más al mes`, compareLess: (x) => `En Valencia/Alicante, unos ${x} menos al mes`, compareNoRate: 'No se pudo obtener el cambio; inténtalo más tarde.',
      kidsFree: 'Menores de 14 viajan gratis; hay abono reducido para menores de 31.', notes: 'El supermercado se calcula con una cesta básica a precios actuales más un 60 % para el resto de productos. Cada niño cuenta como el 60 % de un adulto. Importes orientativos.',
      numbeo: (s, f) => `Referencia Numbeo, sin alquiler: ~${s} una persona, ~${f} familia de cuatro.`,
    },
    day: { title: 'Un día en el barrio', intro: '¿Cómo sería un día normal viviendo aquí?', fit: 'Para quién', sea: 'Mar', transit: 'Transporte' },
    compare: { title: 'Compara barrios', intro: 'Elige dos barrios y míralos lado a lado.', pick: 'Elige barrio', rows: { sale: 'Precio de venta', rent: 'Alquiler', sea: 'Acceso al mar', transit: 'Transporte', noise: 'Ruido', family: 'Para familias', night: 'Vida nocturna' }, levels: ['Bajo', 'Medio', 'Alto'], none: 'Sin datos', note: 'Precios de fuentes públicas leídas en noviembre de 2026; ruido, familias y vida nocturna son valoración de Lock & Loft.' },
    community: { title: 'Comunidad turca y sabores conocidos', intro: 'Seamos sinceros: en Valencia y Alicante no hay un gran barrio turco; la comunidad es pequeña y dispersa. Aun así, es fácil encontrar sabores conocidos, productos halal y resolver trámites oficiales.', types: { food: 'Restaurante', shop: 'Tienda y carnicería', faith: 'Mezquita', official: 'Oficial' }, cities: { valencia: 'Valencia', alicante: 'Alicante', both: 'Toda la región' }, map: 'Ver en el mapa', flights: 'Vuelos directos a Turquía', note: 'Lugares comprobados en listados públicos en noviembre de 2026; los horarios cambian, confírmalos antes de ir.', ask: '¿Buscas abogado, gestor o médico que hable turco? Escríbenos y te pasamos los contactos que conocemos.' },
    steps: { title: 'Hoja de ruta para mudarte', intro: 'Pasos en orden. Casi todos piden el documento del anterior.', where: 'Dónde', time: 'Plazo', cost: 'Coste', tip: 'Consejo', note: 'Información general, no asesoramiento legal ni fiscal. Tasas vigentes en 2026.' },
    sourcesTitle: 'Fuentes',
  },
  en: {
    cost: {
      title: 'Work out your monthly cost of living', intro: 'Pick your household and lifestyle; we calculate with current Valencia or Alicante prices.',
      city: 'City', household: 'Household', households: { single: 'Single', couple: 'Couple', family1: 'Couple + 1 child', family2: 'Couple + 2 children' },
      housing: 'Housing', housings: { own: 'I own', rent: 'I rent' }, price: 'Home price (€)', rentSize: 'Rental flat', rents: { c1: '1 bed, centre', o1: '1 bed, outside centre', c3: '3 bed, centre', o3: '3 bed, outside centre' },
      school: 'School', schools: { public: 'State school', intl: 'International school' }, health: 'Health', healths: { public: 'Public (SIP)', private: 'Private insurance' },
      car: 'I drive', dinners: 'Dinners out per month (for two)', gym: 'Gym membership',
      rows: { market: 'Groceries', dining: 'Eating out', utilities: 'Electricity, water, gas', telecom: 'Internet and mobile', transit: 'Public transport (monthly pass)', health: 'Private health insurance', school: 'International school (monthly)', home: 'Community fees, IBI, home insurance', rent: 'Rent', car: 'Fuel (~800 km a month)', gym: 'Gym', other: 'Other spending' },
      other: 'Other spending per person (clothes, leisure, personal care)',
      total: 'Monthly total', perYear: 'Per year', approxTry: 'Approx. in TRY',
      compareTitle: 'Compare with what you spend today', compareLabel: 'Roughly how many lira do you spend a month now? (rent included)', compareMore: (x) => `About ${x} more a month in Valencia/Alicante`, compareLess: (x) => `About ${x} less a month in Valencia/Alicante`, compareNoRate: 'Could not load the exchange rate; try again later.',
      kidsFree: 'Under-14s ride free; there is a discounted pass for under-31s.', notes: 'Groceries use a basic basket at current prices plus 60% for everything else. Each child counts as 60% of an adult. Figures are indicative.',
      numbeo: (s, f) => `Numbeo reference, excluding rent: ~${s} single, ~${f} family of four.`,
    },
    day: { title: 'A day in the neighbourhood', intro: 'What would an ordinary day look like if you lived here?', fit: 'Who it suits', sea: 'Beach', transit: 'Transport' },
    compare: { title: 'Compare neighbourhoods', intro: 'Pick two and see them side by side.', pick: 'Pick a neighbourhood', rows: { sale: 'Sale price', rent: 'Rent', sea: 'Getting to the beach', transit: 'Transport', noise: 'Noise', family: 'Family-friendly', night: 'Nightlife' }, levels: ['Low', 'Medium', 'High'], none: 'No data', note: 'Prices from public sources read in November 2026; noise, family and nightlife scores are Lock & Loft’s own assessment.' },
    community: { title: 'Turkish community and familiar food', intro: 'To be honest: there is no big Turkish quarter in Valencia or Alicante, and the community is small and spread out. Still, familiar food, halal products and official services are easy to reach.', types: { food: 'Restaurant', shop: 'Shop and butcher', faith: 'Mosque', official: 'Official' }, cities: { valencia: 'Valencia', alicante: 'Alicante', both: 'Whole region' }, map: 'Open in maps', flights: 'Direct flights to Türkiye', note: 'Places checked in public listings in November 2026; hours change, so confirm before you go.', ask: 'Looking for a Turkish-speaking lawyer, gestor or doctor? Message us and we will share the people we know.' },
    steps: { title: 'Moving roadmap', intro: 'Steps in order. Most need the document from the step before.', where: 'Where', time: 'Time', cost: 'Cost', tip: 'Tip', note: 'General information, not legal or tax advice. Fees as of 2026.' },
    sourcesTitle: 'Sources',
  },
  de: {
    cost: {
      title: 'Monatliche Lebenshaltungskosten berechnen', intro: 'Haushalt und Lebensstil wählen; berechnet mit aktuellen Preisen in Valencia oder Alicante.',
      city: 'Stadt', household: 'Haushalt', households: { single: 'Single', couple: 'Paar', family1: 'Paar + 1 Kind', family2: 'Paar + 2 Kinder' },
      housing: 'Wohnen', housings: { own: 'Eigentum', rent: 'Miete' }, price: 'Kaufpreis (€)', rentSize: 'Mietwohnung', rents: { c1: '1 Zi., Zentrum', o1: '1 Zi., außerhalb', c3: '3 Zi., Zentrum', o3: '3 Zi., außerhalb' },
      school: 'Schule', schools: { public: 'Staatlich', intl: 'International' }, health: 'Gesundheit', healths: { public: 'Öffentlich (SIP)', private: 'Privatversicherung' },
      car: 'Ich fahre Auto', dinners: 'Abendessen auswärts pro Monat (zu zweit)', gym: 'Fitnessstudio',
      rows: { market: 'Lebensmittel', dining: 'Auswärts essen', utilities: 'Strom, Wasser, Gas', telecom: 'Internet und Handy', transit: 'Nahverkehr (Monatskarte)', health: 'Private Krankenversicherung', school: 'Internationale Schule (Monat)', home: 'Hausgeld, IBI, Hausratversicherung', rent: 'Miete', car: 'Kraftstoff (~800 km/Monat)', gym: 'Fitnessstudio', other: 'Sonstiges' },
      other: 'Sonstiges pro Person (Kleidung, Freizeit, Körperpflege)',
      total: 'Monatlich gesamt', perYear: 'Pro Jahr', approxTry: 'Ungefähr in TRY',
      compareTitle: 'Mit Ihren heutigen Ausgaben vergleichen', compareLabel: 'Wie viel Lira geben Sie heute etwa pro Monat aus? (inkl. Miete)', compareMore: (x) => `In Valencia/Alicante etwa ${x} mehr pro Monat`, compareLess: (x) => `In Valencia/Alicante etwa ${x} weniger pro Monat`, compareNoRate: 'Wechselkurs nicht verfügbar; später erneut versuchen.',
      kidsFree: 'Unter 14 fahren gratis; für unter 31 gibt es eine ermäßigte Karte.', notes: 'Lebensmittel: ein Grundwarenkorb zu aktuellen Preisen plus 60 % für alles Weitere. Kinder zählen 60 % eines Erwachsenen. Richtwerte.',
      numbeo: (s, f) => `Numbeo-Referenz ohne Miete: ~${s} Single, ~${f} vierköpfige Familie.`,
    },
    day: { title: 'Ein Tag im Viertel', intro: 'Wie sähe ein normaler Tag aus, wenn Sie hier wohnten?', fit: 'Passt zu', sea: 'Strand', transit: 'Verkehr' },
    compare: { title: 'Viertel vergleichen', intro: 'Zwei Viertel wählen und nebeneinander sehen.', pick: 'Viertel wählen', rows: { sale: 'Kaufpreis', rent: 'Miete', sea: 'Weg zum Strand', transit: 'Verkehr', noise: 'Lärm', family: 'Familienfreundlich', night: 'Nachtleben' }, levels: ['Niedrig', 'Mittel', 'Hoch'], none: 'Keine Daten', note: 'Preise aus öffentlichen Quellen, gelesen im November 2026; Lärm, Familie und Nachtleben sind eine Einschätzung von Lock & Loft.' },
    community: { title: 'Türkische Gemeinde und vertraute Küche', intro: 'Ehrlich gesagt: In Valencia und Alicante gibt es kein großes türkisches Viertel, die Gemeinde ist klein und verstreut. Vertraute Küche, Halal-Produkte und Behördengänge sind trotzdem gut erreichbar.', types: { food: 'Restaurant', shop: 'Laden und Metzger', faith: 'Moschee', official: 'Behörde' }, cities: { valencia: 'Valencia', alicante: 'Alicante', both: 'Ganze Region' }, map: 'In Karten öffnen', flights: 'Direktflüge in die Türkei', note: 'Orte im November 2026 in öffentlichen Verzeichnissen geprüft; Öffnungszeiten ändern sich, bitte vorher bestätigen.', ask: 'Sie suchen einen türkischsprachigen Anwalt, Gestor oder Arzt? Schreiben Sie uns, wir teilen unsere Kontakte.' },
    steps: { title: 'Umzugsfahrplan', intro: 'Schritte in Reihenfolge. Die meisten brauchen das Dokument aus dem vorherigen Schritt.', where: 'Wo', time: 'Dauer', cost: 'Kosten', tip: 'Tipp', note: 'Allgemeine Information, keine Rechts- oder Steuerberatung. Gebühren Stand 2026.' },
    sourcesTitle: 'Quellen',
  },
};
export const lifeUi = (locale) => UI[locale] || UI.tr;
