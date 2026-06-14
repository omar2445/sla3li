// Algerian Darja (dialect) synonym dictionary.
// Each entry maps Darja spellings (romanized + Arabic script) to the real
// product terms used in name / name_ar / category columns so search works
// even when the user types in dialect.
//
// Keys are lower-cased darja words/phrases; values are arrays of extra
// search terms to inject alongside the original query.

const DARJA = [
  // ─── Oils & fats ────────────────────────────────────────────────────────
  { darja: ['zit', 'zit zitoun', 'l7uil', 'lhuile', 'زيت', 'زيت الزيتون'], terms: ['huile', 'oil', 'زيت', 'زيتون', 'olive'] },
  { darja: ['dhan', 'smen', 'سمن', 'دهن'], terms: ['beurre', 'butter', 'سمن', 'دهن', 'graisse'] },

  // ─── Flour & grains ─────────────────────────────────────────────────────
  { darja: ['dkik', 'd9i9', 'فرينة', 'دقيق', 'frina', 'farine'], terms: ['farine', 'flour', 'دقيق', 'farina'] },
  { darja: ['rozz', 'roz', 'riz', 'رز', 'روز'], terms: ['riz', 'rice', 'رز'] },
  { darja: ['smid', 'semoule', 'سميد'], terms: ['semoule', 'semolina', 'سميد', 'semida'] },
  { darja: ['sha3ir', 'شعير', 'orge'], terms: ['orge', 'barley', 'شعير'] },
  { darja: ['7bub', 'حبوب', 'grains', 'céréales'], terms: ['céréales', 'grains', 'حبوب'] },

  // ─── Sugar & sweeteners ─────────────────────────────────────────────────
  { darja: ['sukar', 'sukkar', 'سكر', 'sucre'], terms: ['sucre', 'sugar', 'سكر'] },
  { darja: ['3asal', 'عسل', 'miel'], terms: ['miel', 'honey', 'عسل'] },

  // ─── Salt & spices ──────────────────────────────────────────────────────
  { darja: ['melh', 'ملح', 'sel', 'salt'], terms: ['sel', 'salt', 'ملح'] },
  { darja: ['bzar', 'بزار', 'poivre', 'pepper'], terms: ['poivre', 'pepper', 'بهارات', 'épices', 'spices'] },
  { darja: ['kamoun', 'كمون', 'cumin'], terms: ['cumin', 'كمون'] },
  { darja: ['harissa', 'harrissa', 'هريسة'], terms: ['harissa', 'هريسة', 'piment', 'sauce'] },
  { darja: ['ras el hanout', 'ras hanout', 'رأس الحانوت'], terms: ['épices', 'spices', 'ras el hanout', 'بهارات'] },

  // ─── Pasta & bread ──────────────────────────────────────────────────────
  { darja: ['m3akrouna', 'ma3krouna', 'معكرونة', 'pasta', 'pâtes'], terms: ['pâtes', 'pasta', 'معكرونة', 'spaghetti', 'macaroni'] },
  { darja: ['khobz', 'xobz', 'خبز', 'pain', 'kesra'], terms: ['pain', 'bread', 'خبز', 'kesra', 'galette'] },
  { darja: ['bskoui', 'biskwi', 'gato', 'gâteau', 'بسكوي', 'حلويات'], terms: ['biscuits', 'gâteaux', 'حلويات', 'pâtisserie', 'confiserie'] },

  // ─── Beverages ──────────────────────────────────────────────────────────
  { darja: ['kahwa', 'qahwa', 'قهوة', 'café'], terms: ['café', 'coffee', 'قهوة', 'nescafé'] },
  { darja: ['atay', 'tay', 'شاي', 'thé', 'tea'], terms: ['thé', 'tea', 'شاي', 'tisane', 'infusion'] },
  { darja: ['lma', 'l\'ma', 'ماء', 'eau', 'water'], terms: ['eau', 'water', 'ماء', 'boisson'] },
  { darja: ['3asir', 'asir', 'عصير', 'jus'], terms: ['jus', 'juice', 'عصير', 'boisson', 'nectar'] },
  { darja: ['limonada', 'soda', 'limonade'], terms: ['limonade', 'soda', 'boisson gazeuse', 'مشروب'] },

  // ─── Dairy ──────────────────────────────────────────────────────────────
  { darja: ['l7lib', 'lhleb', 'حليب', 'lait', 'milk'], terms: ['lait', 'milk', 'حليب', 'dairy', 'laitier'] },
  { darja: ['jben', 'fromage', 'جبن', 'cheese'], terms: ['fromage', 'cheese', 'جبن'] },
  { darja: ['zebda', 'زبدة', 'beurre', 'butter'], terms: ['beurre', 'butter', 'زبدة'] },
  { darja: ['rayeb', 'رايب', 'yaourt', 'yogurt'], terms: ['yaourt', 'yogurt', 'رايب', 'lait fermenté'] },
  { darja: ['lben', 'لبن', 'lait ribot', 'babeurre'], terms: ['lben', 'lait', 'لبن'] },

  // ─── Eggs ───────────────────────────────────────────────────────────────
  { darja: ['bid', 'beid', 'بيض', 'oeufs', 'eggs'], terms: ['oeufs', 'eggs', 'بيض'] },

  // ─── Meat & poultry ─────────────────────────────────────────────────────
  { darja: ['l7em', 'lahm', 'لحم', 'viande', 'meat'], terms: ['viande', 'meat', 'لحم', 'boeuf', 'agneau', 'mouton'] },
  { darja: ['djej', 'djaj', 'دجاج', 'poulet', 'chicken'], terms: ['poulet', 'chicken', 'دجاج', 'volaille'] },
  { darja: ['l7out', 'hout', 'حوت', 'poisson', 'fish', 'سمك'], terms: ['poisson', 'fish', 'سمك', 'حوت', 'sardine', 'thon'] },
  { darja: ['merguez', 'marga'], terms: ['merguez', 'saucisse', 'مرقاز', 'viande'] },

  // ─── Vegetables ─────────────────────────────────────────────────────────
  { darja: ['khedra', 'خضرة', 'légumes', 'vegetables'], terms: ['légumes', 'vegetables', 'خضر', 'خضرة'] },
  { darja: ['batata', 'بطاطا', 'pommes de terre', 'potato'], terms: ['pommes de terre', 'potato', 'بطاطا', 'frites'] },
  { darja: ['tomatich', 'tomate', 'طماطم', 'tomatem'], terms: ['tomate', 'tomato', 'طماطم', 'concentré'] },
  { darja: ['besla', 'بصلة', 'oignon', 'onion'], terms: ['oignon', 'onion', 'بصل'] },
  { darja: ['thoum', 'ثوم', 'ail', 'garlic'], terms: ['ail', 'garlic', 'ثوم'] },
  { darja: ['kosa', 'كوسة', 'courgette', 'zucchini'], terms: ['courgette', 'zucchini', 'كوسة'] },
  { darja: ['felfla', 'flfla', 'فلفلة', 'poivron', 'pepper'], terms: ['poivron', 'pepper', 'فلفل'] },
  { darja: ['jelbana', 'جلبانة', 'petits pois', 'peas'], terms: ['petits pois', 'pois', 'جلبانة', 'légumes'] },
  { darja: ['karnoun', 'karnoune', 'artichaut', 'قرنون'], terms: ['artichaut', 'كرنون', 'légumes'] },
  { darja: ['slata', 'سلاطة', 'salade', 'salad'], terms: ['salade', 'salad', 'سلطة'] },
  { darja: ['3diss', 'adas', 'عدس', 'lentilles'], terms: ['lentilles', 'lentils', 'عدس'] },
  { darja: ['loubia', 'لوبيا', 'haricots', 'beans'], terms: ['haricots', 'beans', 'لوبيا', 'légumineuses'] },
  { darja: ['7ommos', '7ommus', 'حمص', 'pois chiche', 'chickpeas'], terms: ['pois chiche', 'chickpeas', 'حمص'] },

  // ─── Fruits ─────────────────────────────────────────────────────────────
  { darja: ['fakha', 'فاكهة', 'fruits'], terms: ['fruits', 'فواكه', 'fruit'] },
  { darja: ['teffah', 'تفاح', 'pomme', 'apple'], terms: ['pomme', 'apple', 'تفاح'] },
  { darja: ['limo', 'citron', 'ليمون', 'lemon'], terms: ['citron', 'lemon', 'ليمون', 'lime'] },
  { darja: ['3inab', 'raisin', 'عنب', 'grape'], terms: ['raisin', 'grape', 'عنب'] },
  { darja: ['bartokal', 'orange', 'برتقال'], terms: ['orange', 'برتقال', 'agrumes'] },
  { darja: ['l3nachrous', 'abricot', 'مشمش'], terms: ['abricot', 'مشمش', 'fruits'] },

  // ─── Cleaning & hygiene ─────────────────────────────────────────────────
  { darja: ['saboun', 'صابون', 'savon', 'soap'], terms: ['savon', 'soap', 'صابون', 'hygiène', 'nettoyage'] },
  { darja: ['ghsoul', 'ghassoul', 'غسول', 'lessive', 'détergent'], terms: ['lessive', 'détergent', 'nettoyant', 'غسيل', 'propre'] },
  { darja: ['javel', 'javil', 'جافيل', 'eau de javel', 'bleach'], terms: ['javel', 'bleach', 'désinfectant', 'نظافة'] },
  { darja: ['sha3r', 'shampooing', 'شامبو'], terms: ['shampooing', 'shampoo', 'شامبو', 'cheveux', 'hygiène'] },

  // ─── Packaging & household ──────────────────────────────────────────────
  { darja: ['kisan', 'kizan', 'كيسان', 'verres', 'glasses'], terms: ['verres', 'cups', 'كوب', 'gobelets', 'emballage'] },
  { darja: ['plastic', 'blastik', 'بلاستيك'], terms: ['plastique', 'emballage', 'sac', 'كيس'] },
  { darja: ['karto', 'carton', 'كرتون'], terms: ['carton', 'emballage', 'boîte', 'كرتون'] },
];

// Build a fast lookup: normalize input → list of extra terms to search
const index = new Map();
for (const entry of DARJA) {
  for (const word of entry.darja) {
    index.set(word.toLowerCase().trim(), entry.terms);
  }
}

/**
 * Given a raw search string, return an array of all terms to search for.
 * Always includes the original query. Adds extra terms when Darja words are matched.
 */
function expandSearch(raw) {
  if (!raw) return [];
  const normalized = raw.toLowerCase().trim();
  const terms = new Set([normalized]);

  // Check the whole phrase
  if (index.has(normalized)) {
    for (const t of index.get(normalized)) terms.add(t.toLowerCase());
  }

  // Check individual words in the phrase
  for (const word of normalized.split(/\s+/)) {
    if (index.has(word)) {
      for (const t of index.get(word)) terms.add(t.toLowerCase());
    }
  }

  return [...terms];
}

module.exports = { expandSearch };
