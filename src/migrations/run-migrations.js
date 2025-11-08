const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Create database connection based on environment variables
const dialect = process.env.DB_DIALECT || 'postgres';

let sequelize;
if (dialect === 'postgres') {
  sequelize = new Sequelize({
    dialect: dialect,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'pos_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'your_password',
    logging: false
  });
} else {
  throw new Error('Desteklenmeyen veritabanı türü. "postgres" kullanın');
}

// Migration fonksiyonu
async function runMigrations() {
  try {
    console.log('Veritabanı bağlantısı kuruluyor...');
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarılı.');

    // Define Table model
    const Table = sequelize.define('Table', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      status: {
        type: DataTypes.ENUM('available', 'occupied'),
        defaultValue: 'available'
      }
    }, {
      tableName: 'tables',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });
    
    // Define Product model
    const Product = sequelize.define('Product', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true
      }
    }, {
      tableName: 'products',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });
    
    // Define Order model
    const Order = sequelize.define('Order', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      tableId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'table_id'
      },
      status: {
        type: DataTypes.ENUM('open', 'paid', 'cancelled'),
        defaultValue: 'open'
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        field: 'total_amount'
      },
      paymentMethod: {
        type: DataTypes.ENUM('cash', 'card'),
        allowNull: true,
        field: 'payment_method'
      }
    }, {
      tableName: 'orders',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });
    
    // Define OrderItem model
    const OrderItem = sequelize.define('OrderItem', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'order_id'
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'product_id'
      },
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      }
    }, {
      tableName: 'order_items',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });
    
    // Define relationships
    Order.belongsTo(Table, { foreignKey: 'table_id' });
    OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
    OrderItem.belongsTo(Product, { foreignKey: 'product_id' });
    
    // Sync models with database
    await sequelize.sync({ alter: true });
    
    console.log('Tüm migrationlar tamamlandı.');
    await sequelize.close();
  } catch (error) {
    console.error('Migration sırasında hata oluştu:', error);
    process.exit(1);
  }
}

// Migration'ları çalıştır
runMigrations();