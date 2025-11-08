const Database = require('./src/database/database');

async function testDatabase() {
  try {
    const database = new Database();
    
    // Veritabanı bağlantısını test et
    await database.sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarılı.');
    
    // Tabloları getir
    const tables = await database.getTables();
    console.log('Mevcut tablolar:', tables);
    
    // Tabloların ID'lerini kontrol et
    tables.forEach(table => {
      console.log(`Table ID: ${table.id}, Name: ${table.name}, Type: ${typeof table.id}`);
    });
    
    // Ürünleri getir
    const products = await database.getProducts();
    console.log('Mevcut ürünler:', products);
    
    // Ürünlerin ID'lerini kontrol et
    products.forEach(product => {
      console.log(`Product ID: ${product.id}, Name: ${product.name}, Type: ${typeof product.id}`);
    });
    
    await database.sequelize.close();
  } catch (error) {
    console.error('Veritabanı testi sırasında hata oluştu:', error);
  }
}

testDatabase();