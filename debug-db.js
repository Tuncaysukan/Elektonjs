const Database = require('./src/database/database');

async function debugDatabase() {
  try {
    console.log('Veritabanı bağlantısı kuruluyor...');
    const database = new Database();
    
    // Veritabanı bağlantısını test et
    await database.sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarılı.');
    
    // Tabloları getir
    console.log('\n--- TABLOLARI ÇEKİYORUZ ---');
    const tables = await database.getTables();
    console.log('Çekilen tablolar:', tables);
    
    // Her tablonun detaylarını göster
    tables.forEach((table, index) => {
      console.log(`\nTablo ${index + 1}:`);
      console.log('  ID:', table.id, '(tip:', typeof table.id, ')');
      console.log('  İsim:', table.name);
      console.log('  Durum:', table.status);
    });
    
    // Ürünleri getir
    console.log('\n--- ÜRÜNLERİ ÇEKİYORUZ ---');
    const products = await database.getProducts();
    console.log('Çekilen ürünler:', products);
    
    // Her ürünün detaylarını göster
    products.forEach((product, index) => {
      console.log(`\nÜrün ${index + 1}:`);
      console.log('  ID:', product.id, '(tip:', typeof product.id, ')');
      console.log('  İsim:', product.name);
      console.log('  Fiyat:', product.price);
      console.log('  Kategori:', product.category);
    });
    
    // Siparişleri getir
    console.log('\n--- SİPARİŞLERİ ÇEKİYORUZ ---');
    const orders = await database.getOrders();
    console.log('Çekilen siparişler:', orders);
    
    // Her siparişin detaylarını göster
    orders.forEach((order, index) => {
      console.log(`\nSipariş ${index + 1}:`);
      console.log('  ID:', order.id, '(tip:', typeof order.id, ')');
      console.log('  Masa ID:', order.tableId, '(tip:', typeof order.tableId, ')');
      console.log('  Durum:', order.status);
      console.log('  Toplam Tutar:', order.totalAmount);
    });
    
    await database.sequelize.close();
    console.log('\nVeritabanı bağlantısı kapatıldı.');
  } catch (error) {
    console.error('Hata oluştu:', error);
  }
}

debugDatabase();