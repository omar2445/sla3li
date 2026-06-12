require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('./database');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('Seeding database...');

  // Categories
  const cats = [
    ['Food & Beverages', 'مواد غذائية', '🍞'],
    ['Cleaning Products', 'منتجات التنظيف', '🧴'],
    ['Electronics', 'إلكترونيات', '📱'],
    ['Clothing & Textiles', 'ملابس ومنسوجات', '👗'],
    ['Construction Materials', 'مواد البناء', '🏗️'],
    ['Agricultural Products', 'منتجات زراعية', '🌿'],
    ['Cosmetics & Hygiene', 'مستحضرات التجميل', '💄'],
    ['Stationery & Office', 'قرطاسية ومكتبيات', '📚'],
    ['Hardware & Tools', 'أدوات ومعدات', '🔧'],
    ['Accessories', 'إكسسوارات', '👜'],
  ];

  for (const [name, name_ar, icon] of cats) {
    const exists = await db.prepare('SELECT id FROM categories WHERE name=?').get(name);
    if (!exists) await db.prepare('INSERT INTO categories (name, name_ar, icon) VALUES (?,?,?)').run(name, name_ar, icon);
  }

  const hash = (p) => bcrypt.hashSync(p, 10);

  const users = [
    { name: 'Admin Sla3Li', name_ar: 'مدير المنصة', email: 'admin@sla3li.dz', password: 'admin123', role: 'admin', phone: '0550000000', wilaya: 'Alger', address: '', business_name: '', business_name_ar: '', is_approved: 1 },
    { name: 'Karim Benali', name_ar: 'كريم بن علي', email: 'wholesaler1@sla3li.dz', password: 'pass123', role: 'wholesaler', phone: '0551234567', wilaya: 'Alger', address: 'Zone Industrielle, Rouiba, Alger', business_name: 'Benali Distribution', business_name_ar: 'توزيع بن علي', is_approved: 1 },
    { name: 'Fatima Hadj', name_ar: 'فاطمة حاج', email: 'wholesaler2@sla3li.dz', password: 'pass123', role: 'wholesaler', phone: '0661234567', wilaya: 'Oran', address: 'Zone Commerciale, Oran', business_name: 'Hadj Grossiste', business_name_ar: 'حاج بالجملة', is_approved: 1 },
    { name: 'Ahmed Boudiaf', name_ar: 'أحمد بوضياف', email: 'wholesaler3@sla3li.dz', password: 'pass123', role: 'wholesaler', phone: '0771234567', wilaya: 'Constantine', address: 'Marché de Gros, Constantine', business_name: 'Boudiaf Commerce', business_name_ar: 'تجارة بوضياف', is_approved: 1 },
    { name: 'Leila Merbah', name_ar: 'ليلى مرباح', email: 'retailer1@sla3li.dz', password: 'pass123', role: 'retailer', phone: '0661112233', wilaya: 'Alger', address: 'Bab El Oued, Alger', business_name: '', business_name_ar: '', is_approved: 1 },
    { name: 'Youcef Khelifi', name_ar: 'يوسف خليفي', email: 'retailer2@sla3li.dz', password: 'pass123', role: 'retailer', phone: '0771112233', wilaya: 'Blida', address: 'Centre ville, Blida', business_name: '', business_name_ar: '', is_approved: 1 },
    { name: 'Omar Rahmani', name_ar: 'عمر رحماني', email: 'driver1@sla3li.dz', password: 'pass123', role: 'driver', phone: '0551112233', wilaya: 'Alger', address: '', business_name: '', business_name_ar: '', is_approved: 1 },
    { name: 'Samir Touati', name_ar: 'سمير تواتي', email: 'driver2@sla3li.dz', password: 'pass123', role: 'driver', phone: '0661112244', wilaya: 'Oran', address: '', business_name: '', business_name_ar: '', is_approved: 1 },
  ];

  const userIds = {};
  for (const u of users) {
    const existing = await db.prepare('SELECT id FROM users WHERE email=?').get(u.email);
    if (existing) { userIds[u.email] = existing.id; continue; }
    const r = await db.prepare('INSERT INTO users (name, name_ar, email, password_hash, role, phone, wilaya, address, business_name, business_name_ar, is_approved) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
      .run(u.name, u.name_ar, u.email, hash(u.password), u.role, u.phone, u.wilaya, u.address, u.business_name, u.business_name_ar, u.is_approved);
    userIds[u.email] = r.lastInsertRowid;
  }

  const getCatId = async (name) => (await db.prepare('SELECT id FROM categories WHERE name=?').get(name))?.id;

  const w1 = userIds['wholesaler1@sla3li.dz'];
  const w2 = userIds['wholesaler2@sla3li.dz'];
  const w3 = userIds['wholesaler3@sla3li.dz'];

  const products = [
    [w1, await getCatId('Food & Beverages'), 'Olive Oil 5L', 'زيت الزيتون 5 لتر', 'Premium quality Algerian olive oil', 'زيت زيتون جزائري عالي الجودة', 1200, 10, 'bottle', 'قارورة', 500, '[]'],
    [w1, await getCatId('Food & Beverages'), 'Semolina 25kg', 'سميد 25 كغ', 'Fine semolina for couscous', 'سميد ناعم لصنع الكسكسي', 2500, 5, 'bag', 'كيس', 300, '[]'],
    [w1, await getCatId('Cleaning Products'), 'Dish Soap 1L x24', 'صابون أطباق 1 لتر × 24', 'Industrial grade dish soap carton', 'كرتون صابون أطباق صناعي', 1800, 3, 'carton', 'كرتون', 200, '[]'],
    [w1, await getCatId('Food & Beverages'), 'Sugar 50kg', 'سكر 50 كغ', 'Refined white sugar', 'سكر أبيض مكرر', 4500, 2, 'bag', 'كيس', 150, '[]'],
    [w2, await getCatId('Cleaning Products'), 'Bleach 5L x6', 'جافيل 5 لتر × 6', 'Industrial bleach for wholesale', 'جافيل صناعي بالجملة', 1200, 6, 'carton', 'كرتون', 400, '[]'],
    [w2, await getCatId('Cosmetics & Hygiene'), 'Shampoo 500ml x24', 'شامبو 500مل × 24', 'Anti-dandruff shampoo carton', 'كرتون شامبو ضد القشرة', 4800, 2, 'carton', 'كرتون', 180, '[]'],
    [w2, await getCatId('Food & Beverages'), 'Canned Tomatoes x24', 'طماطم معلبة × 24', 'Quality canned tomatoes carton', 'كرتون طماطم معلبة عالية الجودة', 1400, 5, 'carton', 'كرتون', 250, '[]'],
    [w3, await getCatId('Stationery & Office'), 'Copy Paper A4 Box', 'ورق طباعة A4', '5 reams of A4 copy paper', '5 رزم ورق طباعة A4', 900, 10, 'box', 'صندوق', 100, '[]'],
    [w3, await getCatId('Electronics'), 'USB Charger 5W', 'شاحن USB 5 واط', 'Universal USB charger bulk pack', 'باقة شواحن USB بالجملة', 350, 20, 'piece', 'قطعة', 500, '[]'],
    [w3, await getCatId('Agricultural Products'), 'Fertilizer 25kg', 'سماد زراعي 25 كغ', 'NPK balanced fertilizer', 'سماد NPK متوازن', 1800, 5, 'bag', 'كيس', 80, '[]'],
  ];

  const prodIds = [];
  for (const p of products) {
    const existing = await db.prepare('SELECT id FROM products WHERE name=? AND wholesaler_id=?').get(p[2], p[0]);
    if (!existing) {
      const r = await db.prepare('INSERT INTO products (wholesaler_id, category_id, name, name_ar, description, description_ar, price, min_order_qty, unit, unit_ar, stock_qty, images) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').run(...p);
      prodIds.push(r.lastInsertRowid);
    } else {
      prodIds.push(existing.id);
    }
  }

  const r1 = userIds['retailer1@sla3li.dz'];
  const r2 = userIds['retailer2@sla3li.dz'];

  const existingOrders = await db.prepare('SELECT COUNT(*) as c FROM orders').get();
  if (existingOrders.c === 0 && prodIds.length >= 3) {
    const o1 = await db.prepare("INSERT INTO orders (retailer_id, wholesaler_id, status, total_amount, delivery_address) VALUES (?,?,'delivered',13000,'Bab El Oued, Alger')").run(r1, w1);
    await db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES (?,?,?,?,?)').run(o1.lastInsertRowid, prodIds[0], 5, 1200, 6000);
    await db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES (?,?,?,?,?)').run(o1.lastInsertRowid, prodIds[1], 2, 2500, 5000);
    await db.prepare("INSERT INTO deliveries (order_id, driver_id, status, delivery_address) VALUES (?,?,'delivered','Bab El Oued, Alger')").run(o1.lastInsertRowid, userIds['driver1@sla3li.dz']);

    const o2 = await db.prepare("INSERT INTO orders (retailer_id, wholesaler_id, status, total_amount, delivery_address) VALUES (?,?,'processing',7200,'Centre ville, Blida')").run(r2, w2);
    await db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES (?,?,?,?,?)').run(o2.lastInsertRowid, prodIds[4], 6, 1200, 7200);
    await db.prepare("INSERT INTO deliveries (order_id, status, delivery_address) VALUES (?,'pending','Centre ville, Blida')").run(o2.lastInsertRowid);

    const o3 = await db.prepare("INSERT INTO orders (retailer_id, wholesaler_id, status, total_amount, delivery_address) VALUES (?,?,'pending',9600,'Bab El Oued, Alger')").run(r1, w2);
    await db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES (?,?,?,?,?)').run(o3.lastInsertRowid, prodIds[5], 2, 4800, 9600);
    await db.prepare("INSERT INTO deliveries (order_id, status, delivery_address) VALUES (?,'pending','Bab El Oued, Alger')").run(o3.lastInsertRowid);
  }

  console.log('\n✅ Database seeded successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('  Admin      → admin@sla3li.dz       / admin123');
  console.log('  Wholesaler → wholesaler1@sla3li.dz  / pass123');
  console.log('  Retailer   → retailer1@sla3li.dz    / pass123');
  console.log('  Driver     → driver1@sla3li.dz      / pass123\n');
}

module.exports = seed;

if (require.main === module) {
  seed().then(() => process.exit(0)).catch(err => { console.error('Seed failed:', err); process.exit(1); });
}
