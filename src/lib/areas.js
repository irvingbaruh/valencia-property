// Search areas for the property filters: all of Valencia and Alicante provinces (not just where listings exist today).
// Place names are proper nouns and stay the same in every language; only the zone headings are translated.

const t = (tr, es, en, de) => ({ tr, es, en, de });

export const PROVINCES = [
  { key: 'valencia', name: t('Valencia', 'Valencia', 'Valencia', 'Valencia') },
  { key: 'alicante', name: t('Alicante', 'Alicante', 'Alicante', 'Alicante') },
];

// [label, aliases...] — aliases are matched against the listing's city/neighbourhood, accents and case ignored.
const m = (name, ...aliases) => ({ name, aliases: [name, ...aliases] });

export const ZONES = [
  {
    key: 'valencia-city', province: 'valencia',
    name: t('Valencia şehri', 'Ciudad de Valencia', 'Valencia city', 'Stadt Valencia'),
    places: [m('Valencia', 'València')],
  },
  {
    key: 'valencia-metro', province: 'valencia',
    name: t('Valencia çevresi', 'Área metropolitana de Valencia', 'Greater Valencia', 'Umland von Valencia'),
    places: [
      m('Paterna'), m('La Cañada (Paterna)', 'La Canada', 'La Cañada'), m('Burjassot'), m('Godella'), m('Rocafort'), m('Moncada', 'Moncada'),
      m('Alboraya', 'Alboraia'), m('Mislata'), m('Manises'), m('Quart de Poblet'), m('Xirivella'), m('Aldaia'), m('Alaquàs', 'Alaquas'),
      m('Torrent'), m('Picanya'), m('Paiporta'), m('Catarroja'), m('Alfafar'), m('Benetússer', 'Benetusser'), m('Massanassa'),
      m("L'Eliana", 'La Eliana', 'Eliana'), m('San Antonio de Benagéber', 'Sant Antoni de Benaixeve'), m('Bétera', 'Betera'),
      m('Torre en Conill'), m('Serra'), m('Náquera', 'Naquera'), m('Rafelbunyol'), m('Foios'), m('Meliana'), m('Puçol', 'Pucol'),
      m('El Puig', 'Puig'), m('Massamagrell'), m('Llíria', 'Liria'), m('Riba-roja de Túria', 'Riba-roja', 'Ribarroja'), m('Chiva'),
    ],
  },
  {
    key: 'valencia-north', province: 'valencia',
    name: t('Sagunto ve kuzey', 'Sagunto y norte', 'Sagunto & north', 'Sagunt & Norden'),
    places: [m('Sagunto', 'Sagunt', 'Puerto de Sagunto', 'Port de Sagunt'), m('Canet d’en Berenguer', 'Canet de Berenguer', 'Canet'), m('Gilet'), m('Estivella')],
  },
  {
    key: 'valencia-south', province: 'valencia',
    name: t('Güney kıyısı ve La Safor', 'Costa sur y La Safor', 'Southern coast & La Safor', 'Südküste & La Safor'),
    places: [
      m('El Saler', 'Saler'), m('Sueca'), m('Cullera'), m('Tavernes de la Valldigna', 'Tavernes'), m('Xeraco'), m('Gandía', 'Gandia'),
      m('Playa de Gandía', 'Platja de Gandia'), m('Bellreguard'), m('Miramar'), m('Piles'), m('Oliva'), m('Daimús', 'Daimus'),
    ],
  },
  {
    key: 'valencia-inland', province: 'valencia',
    name: t('İç kesimler', 'Interior', 'Inland', 'Inland'),
    places: [m('Alzira'), m('Carlet'), m('Xàtiva', 'Xativa', 'Játiva'), m('Ontinyent', 'Onteniente'), m('Requena'), m('Utiel'), m('Buñol', 'Bunol')],
  },
  {
    key: 'alicante-city', province: 'alicante',
    name: t('Alicante şehri ve çevresi', 'Alicante y alrededores', 'Alicante city & surroundings', 'Alicante & Umgebung'),
    places: [
      m('Alicante', 'Alacant', 'Alicante/Alacant'), m('San Juan de Alicante', 'Sant Joan d’Alacant', 'San Juan'), m('Playa de San Juan', 'Platja de Sant Joan'),
      m('El Campello', 'Campello'), m('Mutxamel', 'Muchamiel'), m('Sant Vicent del Raspeig', 'San Vicente del Raspeig'), m('Santa Pola'),
      m('Gran Alacant', 'Gran Alacant'), m('Elche', 'Elx', 'Elche/Elx'), m('Crevillent', 'Crevillente'),
    ],
  },
  {
    key: 'alicante-north', province: 'alicante',
    name: t('Costa Blanca Kuzey', 'Costa Blanca Norte', 'Costa Blanca North', 'Costa Blanca Nord'),
    places: [
      m('Dénia', 'Denia'), m('Els Poblets', 'Poblets'), m('El Verger', 'Verger'), m('Pego'), m('Ondara'), m('Pedreguer'), m('Gata de Gorgos', 'Gata'),
      m('Jávea', 'Xàbia', 'Javea', 'Xabia', 'Jávea/Xàbia'), m('Benitachell', 'Poble Nou de Benitatxell', 'Benitatxell'), m('Moraira'), m('Teulada', 'Teulada-Moraira'),
      m('Benissa'), m('Calpe', 'Calp', 'Calpe/Calp'), m('Altea'), m('Alfaz del Pi', 'L’Alfàs del Pi', 'Alfas del Pi'), m('La Nucía', 'La Nucia', 'Nucia'),
      m('Polop'), m('Callosa d’en Sarrià', 'Callosa d en Sarria'), m('Alcalalí', 'Alcalali'), m('Jalón', 'Xaló', 'Jalon'), m('Orba'), m('Senija'),
    ],
  },
  {
    key: 'alicante-benidorm', province: 'alicante',
    name: t('Benidorm ve Marina Baixa', 'Benidorm y Marina Baixa', 'Benidorm & Marina Baixa', 'Benidorm & Marina Baixa'),
    places: [m('Benidorm'), m('Finestrat'), m('Villajoyosa', 'La Vila Joiosa', 'Vila Joiosa', 'Villajoyosa/La Vila Joiosa'), m('Cala de Finestrat')],
  },
  {
    key: 'alicante-south', province: 'alicante',
    name: t('Costa Blanca Güney', 'Costa Blanca Sur', 'Costa Blanca South', 'Costa Blanca Süd'),
    places: [
      m('Torrevieja'), m('Orihuela Costa', 'Orihuela-Costa', 'La Zenia', 'Cabo Roig', 'Playa Flamenca', 'Campoamor'), m('Orihuela'), m('Pilar de la Horadada'),
      m('San Miguel de Salinas'), m('Los Montesinos'), m('Guardamar del Segura', 'Guardamar'), m('Rojales', 'Ciudad Quesada'), m('Algorfa'), m('Almoradí', 'Almoradi'),
      m('San Fulgencio', 'Sant Fulgenci'), m('Benijófar', 'Benijofar'), m('Dolores'),
    ],
  },
  {
    key: 'alicante-inland', province: 'alicante',
    name: t('İç kesimler', 'Interior', 'Inland', 'Inland'),
    places: [m('Alcoy', 'Alcoi'), m('Villena'), m('Ibi'), m('Cocentaina'), m('Elda'), m('Petrer', 'Petrel'), m('Novelda'), m('Aspe')],
  },
];

export const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');

const INDEX = new Map(); // normalised alias -> { place, zone }
ZONES.forEach((z) => z.places.forEach((p) => p.aliases.forEach((a) => { const k = norm(a); if (k && !INDEX.has(k)) INDEX.set(k, { place: p, zone: z }); })));

export const placeSlug = (p) => norm(p.name);

// Which known place (and province) a listing belongs to. Tries city, then each part of "A/B", then neighbourhood.
export function matchPlace(city, neighborhood) {
  const tries = [city, ...String(city || '').split(/[\/,]/), neighborhood, ...String(neighborhood || '').split(/[\/,]/)];
  for (const x of tries) {
    const hit = INDEX.get(norm(x));
    if (hit) return { slug: placeSlug(hit.place), name: hit.place.name, zone: hit.zone.key, province: hit.zone.province };
  }
  return null;
}

export function provinceFromRegion(region) {
  const r = norm(region);
  if (r.includes('alicante') || r.includes('alacant')) return 'alicante';
  if (r === 'valencia' || r === 'valencia' || r.includes('valencia')) return r === 'comunidadvalenciana' ? '' : 'valencia';
  return '';
}
