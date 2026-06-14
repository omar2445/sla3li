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
  { darja: ['jben', 'fromage', 'جبن', 'cheese', 'فرماج', 'farmaj', 'formagio', 'chees', 'fromaj'], terms: ['fromage', 'cheese', 'جبن', 'فرماج', 'laitier', 'dairy'] },
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

  // ─── Pastry & street food ────────────────────────────────────────────────
  { darja: ['brick', 'brik', 'بريك', 'bricks', 'briks'], terms: ['brick', 'بريك', 'feuille de brick', 'pâte à brick', 'pastilla', 'feuille', 'pâtisserie'] },
  { darja: ['mlokhiya', 'mloukhia', 'ملوخية'], terms: ['ملوخية', 'mloukhia', 'légumes secs'] },
  { darja: ['bourek', 'bourak', 'بوراك', 'boreks'], terms: ['brick', 'بريك', 'feuille', 'pâte', 'farci'] },
  { darja: ['makroud', 'مقروض'], terms: ['makroud', 'مقروض', 'pâtisserie', 'حلويات', 'gâteau'] },
  { darja: ['chrik', 'chrika', 'شريك'], terms: ['pâtisserie', 'gâteau', 'حلويات', 'brioche'] },
  { darja: ['tamr', 'tmar', 'تمر', 'dattes'], terms: ['dattes', 'dates', 'تمر'] },

  // ─── Stationery & school supplies ───────────────────────────────────────
  { darja: ['stylo', 'stilo', 'ستيلو', 'قلم'], terms: ['stylo', 'pen', 'قلم', 'stylos', 'papeterie', 'stationery', 'bille', 'encre'] },
  { darja: ['pensil', 'pencil', 'qalam', 'crayon', 'قلم رصاص'], terms: ['crayon', 'pencil', 'قلم', 'papeterie', 'stationery', 'رصاص'] },
  { darja: ['papeterie', 'paptriya', 'fournitures', 'لوازم مدرسية'], terms: ['papeterie', 'stationery', 'fournitures scolaires', 'لوازم مدرسية', 'bureau'] },
  { darja: ['classeur', 'cahier', 'دفتر', 'dfater'], terms: ['cahier', 'classeur', 'دفتر', 'papeterie', 'scolaire'] },
  { darja: ['gomme', 'goma', 'ممحاة', 'eraser'], terms: ['gomme', 'eraser', 'ممحاة', 'papeterie'] },
  { darja: ['rgle', 'règle', 'مسطرة', 'ruler'], terms: ['règle', 'ruler', 'مسطرة', 'papeterie'] },
  { darja: ['colle', 'col', 'صمغ', 'glue'], terms: ['colle', 'glue', 'صمغ', 'papeterie', 'adhésif'] },
  { darja: ['ciseaux', 'sizo', 'مقص', 'scissors'], terms: ['ciseaux', 'scissors', 'مقص', 'papeterie'] },
  { darja: ['scotch', 'ruban', 'شريط لاصق'], terms: ['scotch', 'ruban adhésif', 'شريط', 'papeterie', 'emballage'] },
  { darja: ['imprimante', 'toner', 'طابعة', 'printer'], terms: ['imprimante', 'printer', 'طابعة', 'toner', 'cartouche', 'bureau'] },

  // ─── Clothing & textiles ─────────────────────────────────────────────────
  { darja: ['seroual', 'sarwal', 'serwal', 'سروال', 'panse', 'pantalon', 'pants'], terms: ['pantalon', 'pants', 'trousers', 'سروال', 'vêtements', 'clothing', 'textile'] },
  { darja: ['kamija', 'qamis', 'قميص', 'chemise', 'shirt'], terms: ['chemise', 'shirt', 'قميص', 'vêtements', 'textile'] },
  { darja: ['trikot', 'tricot', 'pull', 'chandail', 'تريكو'], terms: ['pull', 'tricot', 'تريكو', 'vêtements', 'textile'] },
  { darja: ['jaka', 'djaka', 'veste', 'jacket', 'جاكيت'], terms: ['veste', 'jacket', 'جاكيت', 'vêtements', 'manteau'] },
  { darja: ['robe', 'rob', 'فستان'], terms: ['robe', 'فستان', 'vêtements', 'textile'] },
  { darja: ['fouta', 'serviette', 'فوطة', 'towel'], terms: ['serviette', 'towel', 'فوطة', 'textile', 'bain'] },
  { darja: ['mlaya', 'haik', 'ملاية', 'drap', 'couverture'], terms: ['couverture', 'drap', 'ملاية', 'textile', 'literie'] },
  { darja: ['chaussures', 'sabat', 'sbat', 'sbbat', 'sabbat', 'صباط', 'shoes', 'shoe', 'souliers', '7dha', 'حذاء', 'أحذية', 'a7dhiya', 'soulier', 'boot', 'basket'], terms: ['chaussures', 'shoes', 'صباط', 'حذاء', 'أحذية', 'sandales', 'basket', 'sneakers', 'bottes', 'mocassins', 'footwear'] },
  { darja: ['jilbab', 'djilbab', 'جلباب', 'abaya', 'عباءة'], terms: ['jilbab', 'abaya', 'جلباب', 'vêtements', 'textile'] },
  { darja: ['tchetcha', 'tchatcha', 'bonnet', 'chapeau', 'قبعة'], terms: ['bonnet', 'chapeau', 'قبعة', 'vêtements', 'textile', 'accessoires'] },
  { darja: ['calcone', 'calcoun', 'sous-vêtement', 'lingerie'], terms: ['sous-vêtements', 'lingerie', 'textile', 'vêtements'] },
  { darja: ['chaussettes', 'jwareb', 'جوارب', 'socks'], terms: ['chaussettes', 'socks', 'جوارب', 'textile'] },
];

// Normalize: lowercase + Unicode NFC so Arabic text from browser matches dictionary keys
const norm = (s) => s.normalize('NFC').toLowerCase().trim();

// Build a fast lookup: normalized darja word → extra search terms
const index = new Map();
for (const entry of DARJA) {
  for (const word of entry.darja) {
    index.set(norm(word), entry.terms);
  }
}

/**
 * Given a raw search string, return an array of all terms to search for.
 * Always includes the original query. Adds extra terms when Darja words are matched.
 */
function expandSearch(raw) {
  if (!raw) return [];
  const normalized = norm(raw);
  const terms = new Set([normalized]);

  const addTerms = (key) => {
    if (index.has(key)) {
      for (const t of index.get(key)) terms.add(norm(t));
    }
  };

  // Check the whole phrase
  addTerms(normalized);

  // Check each individual word
  for (const word of normalized.split(/\s+/)) {
    addTerms(word);
  }

  return [...terms];
}

module.exports = { expandSearch };
