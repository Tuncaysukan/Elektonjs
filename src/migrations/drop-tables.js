const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

async function dropTables() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'pos_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'your_password',
  });

  try {
    console.log('Veritabanı bağlantısı kuruluyor...');
    await client.connect();
    console.log('Veritabanı bağlantısı başarılı.');

    // Tabloları sil (CASCADE ile ilişkili tabloları da siler)
    console.log('Tablolar siliniyor...');
    await client.query('DROP TABLE IF EXISTS order_items, orders, products, tables CASCADE');
    console.log('Tüm tablolar silindi.');
    
    await client.end();
  } catch (error) {
    console.error('Tablo silme sırasında hata oluştu:', error);
    process.exit(1);
  }
}

// Tabloları sil
dropTables();