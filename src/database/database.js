const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

class Database {
  constructor() {
    // Create database connection based on environment variables
    const dialect = process.env.DB_DIALECT || 'postgres';
    
    if (dialect === 'postgres') {
      this.sequelize = new Sequelize({
        dialect: dialect,
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,  
        database: process.env.DB_NAME || 'pos_db',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        logging: false // Set to console.log to see SQL queries
      });
    } else {
      throw new Error('Desteklenmeyen veritabanı türü. "postgres" kullanın');
    }
    
    this.initModels();
  }
  
  async initModels() {
    // Define Table model
    this.Table = this.sequelize.define('Table', {
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
    this.Product = this.sequelize.define('Product', {
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
      },
      stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      lowStockThreshold: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
        allowNull: false,
        field: 'low_stock_threshold'
      }
    }, {
      tableName: 'products',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });
    
    // Define Order model
    this.Order = this.sequelize.define('Order', {
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
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      // Teslimat alanları
      courierId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'courier_id'
      },
      deliveryStatus: {
        type: DataTypes.ENUM('none', 'preparing', 'ready_for_pickup', 'picked_up', 'on_the_way', 'delivered', 'cancelled'),
        defaultValue: 'none',
        field: 'delivery_status'
      },
      deliveryAddress: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'delivery_address'
      },
      deliveryNote: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'delivery_note'
      },
      customerName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'customer_name'
      },
      customerPhone: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'customer_phone'
      },
      estimatedDeliveryTime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'estimated_delivery_time'
      }
    }, {
      tableName: 'orders',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });
    
    // Define OnlineOrder model (3. parti platform siparişleri)
    this.OnlineOrder = this.sequelize.define('OnlineOrder', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      platform: {
        type: DataTypes.ENUM('trendyol', 'yemeksepeti', 'getir'),
        allowNull: false
      },
      platformOrderId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'platform_order_id'
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'order_id'
      },
      customerName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'customer_name'
      },
      customerPhone: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'customer_phone'
      },
      deliveryAddress: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'delivery_address'
      },
      platformStatus: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'platform_status'
      },
      rawData: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'raw_data'
      }
    }, {
      tableName: 'online_orders',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });
    
    // Define ProductMapping model (Ürün eşleştirme)
    this.ProductMapping = this.sequelize.define('ProductMapping', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      platform: {
        type: DataTypes.ENUM('trendyol', 'yemeksepeti', 'getir'),
        allowNull: false
      },
      platformProductId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'platform_product_id'
      },
      platformProductName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'platform_product_name'
      },
      localProductId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'local_product_id'
      }
    }, {
      tableName: 'product_mappings',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['platform', 'platform_product_id']
        }
      ]
    });
    
    // Define User model
    this.User = this.sequelize.define('User', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'full_name'
      },
      role: {
        type: DataTypes.ENUM('admin', 'user'),
        defaultValue: 'user'
      }
    }, {
      tableName: 'users',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });
    
    // Define Courier model
    this.Courier = this.sequelize.define('Courier', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false
      },
      vehiclePlate: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'vehicle_plate'
      },
      status: {
        type: DataTypes.ENUM('available', 'on_delivery', 'off_duty'),
        defaultValue: 'available'
      },
      totalDeliveries: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'total_deliveries'
      },
      activeDeliveryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'active_delivery_id'
      }
    }, {
      tableName: 'couriers',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });
    
    // Define OrderItem model
    this.OrderItem = this.sequelize.define('OrderItem', {
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
    this.Order.belongsTo(this.Table, { foreignKey: 'table_id' });
    this.Order.belongsTo(this.Courier, { foreignKey: 'courier_id' });
    this.OrderItem.belongsTo(this.Order, { foreignKey: 'order_id' });
    this.OrderItem.belongsTo(this.Product, { foreignKey: 'product_id' });
    this.OnlineOrder.belongsTo(this.Order, { foreignKey: 'order_id' });
    this.ProductMapping.belongsTo(this.Product, { foreignKey: 'local_product_id' });
    this.Courier.hasMany(this.Order, { foreignKey: 'courier_id' });
    
    // Sync models with database
    await this.sequelize.sync({ alter: true });
    
    // Varsayılan kullanıcıyı oluştur
    await this.createDefaultUser();
  }
  
  // Table operations
  async getTables() {
    const tables = await this.Table.findAll({ raw: true });
    return tables;
  }
  
  async createTable(name) {
    const table = await this.Table.create({ name });
    return {
      id: table.id,
      name: table.name,
      status: table.status,
      createdAt: table.createdAt,
      updatedAt: table.updatedAt
    };
  }
  
  async deleteTable(id) {
    // id'nin geçerli bir sayı olup olmadığını kontrol et
    if (!id || isNaN(id)) {
      throw new Error('Geçersiz masa ID: ' + id);
    }
    
    return await this.Table.destroy({ where: { id: parseInt(id) } });
  }
  
  async updateTableStatus(id, status) {
    // id'nin geçerli bir sayı olup olmadığını kontrol et
    if (!id || isNaN(id)) {
      throw new Error('Geçersiz masa ID: ' + id);
    }
    
    return await this.Table.update({ status }, { where: { id: parseInt(id) } });
  }
  
  // Product operations
  async getProducts() {
    const products = await this.Product.findAll({ raw: true });
    return products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      category: p.category,
      stock: p.stock,
      lowStockThreshold: p.low_stock_threshold || p.lowStockThreshold,
      createdAt: p.created_at || p.createdAt,
      updatedAt: p.updated_at || p.updatedAt
    }));
  }
  
  async createProduct(productData) {
    // productData'nın geçerli olup olmadığını kontrol et
    if (!productData || !productData.name || !productData.price) {
      throw new Error('Geçersiz ürün verisi');
    }
    
    const validatedData = {
      name: productData.name,
      price: parseFloat(productData.price),
      category: productData.category || null,
      stock: productData.stock !== undefined ? parseInt(productData.stock) : 0,
      lowStockThreshold: productData.lowStockThreshold !== undefined ? parseInt(productData.lowStockThreshold) : 10
    };
    
    const product = await this.Product.create(validatedData);
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
  }
  
  async updateProductStock(productId, quantity) {
    // Parametreleri kontrol et
    if (!productId || isNaN(productId)) {
      throw new Error('Geçersiz ürün ID');
    }
    
    const product = await this.Product.findByPk(parseInt(productId));
    if (!product) {
      throw new Error('Ürün bulunamadı');
    }
    
    const newStock = parseInt(quantity);
    
    if (newStock < 0) {
      throw new Error('Stok miktarı negatif olamaz');
    }
    
    await this.Product.update(
      { stock: newStock },
      { where: { id: parseInt(productId) } }
    );
    
    return { id: productId, stock: newStock };
  }
  
  async decreaseProductStock(productId, quantity) {
    // Parametreleri kontrol et
    if (!productId || isNaN(productId) || !quantity || isNaN(quantity)) {
      throw new Error('Geçersiz parametreler');
    }
    
    const product = await this.Product.findByPk(parseInt(productId));
    if (!product) {
      throw new Error('Ürün bulunamadı');
    }
    
    const newStock = product.stock - parseInt(quantity);
    
    if (newStock < 0) {
      throw new Error(`Yetersiz stok! Mevcut: ${product.stock}, İstenen: ${quantity}`);
    }
    
    await this.Product.update(
      { stock: newStock },
      { where: { id: parseInt(productId) } }
    );
    
    return { id: productId, stock: newStock, lowStock: newStock <= product.lowStockThreshold };
  }
  
  async getLowStockProducts() {
    const products = await this.Product.findAll({
      where: {
        stock: {
          [this.sequelize.Sequelize.Op.lte]: this.sequelize.literal('low_stock_threshold')
        }
      },
      raw: true
    });
    
    return products.map(p => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
      lowStockThreshold: p.low_stock_threshold || p.lowStockThreshold,
      category: p.category
    }));
  }
  
  async updateProduct(productId, productData) {
    if (!productId || isNaN(productId)) {
      throw new Error('Geçersiz ürün ID');
    }
    
    if (!productData || !productData.name || !productData.price) {
      throw new Error('Geçersiz ürün verisi');
    }
    
    const updateData = {
      name: productData.name,
      price: parseFloat(productData.price),
      category: productData.category || null
    };
    
    if (productData.lowStockThreshold !== undefined) {
      updateData.lowStockThreshold = parseInt(productData.lowStockThreshold);
    }
    
    await this.Product.update(updateData, { where: { id: parseInt(productId) } });
    
    const updated = await this.Product.findByPk(parseInt(productId), { raw: true });
    return {
      id: updated.id,
      name: updated.name,
      price: updated.price,
      category: updated.category,
      stock: updated.stock,
      lowStockThreshold: updated.low_stock_threshold || updated.lowStockThreshold
    };
  }
  
  async deleteProduct(id) {
    // id'nin geçerli bir sayı olup olmadığını kontrol et
    if (!id || isNaN(id)) {
      throw new Error('Geçersiz ürün ID: ' + id);
    }
    
    return await this.Product.destroy({ where: { id: parseInt(id) } });
  }
  
  // Order operations
  async getOrders() {
    const orders = await this.Order.findAll({
      include: [{ model: this.Table, attributes: ['id', 'name', 'status'] }],
      raw: false // Include için raw: false kullanmalıyız
    });
    // Include ile birlikte kullanıldığında manuel olarak serialize etmeliyiz
    return orders.map(order => ({
      id: order.id,
      tableId: order.tableId,
      status: order.status,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      note: order.note,
      createdAt: order.created_at || order.createdAt,
      updatedAt: order.updated_at || order.updatedAt,
      Table: order.Table ? {
        id: order.Table.id,
        name: order.Table.name,
        status: order.Table.status
      } : null
    }));
  }
  
  async createOrder(orderData) {
    // orderData'nın geçerli olup olmadığını kontrol et
    if (!orderData || !orderData.tableId) {
      throw new Error('Geçersiz sipariş verisi');
    }
    
    // tableId'nin geçerli bir sayı olup olmadığını kontrol et
    if (isNaN(orderData.tableId)) {
      throw new Error('Geçersiz masa ID: ' + orderData.tableId);
    }
    
    const validatedData = {
      tableId: parseInt(orderData.tableId),
      status: orderData.status || 'open',
      totalAmount: orderData.totalAmount ? parseFloat(orderData.totalAmount) : 0.00
    };
    
    const order = await this.Order.create(validatedData);
    return {
      id: order.id,
      tableId: order.tableId,
      status: order.status,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      note: order.note,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
  }
  
  async addOrderItem(orderItemData) {
    // orderItemData'nın geçerli olup olmadığını kontrol et
    if (!orderItemData || !orderItemData.orderId || !orderItemData.productId || !orderItemData.price) {
      throw new Error('Geçersiz sipariş öğesi verisi');
    }
    
    // orderId ve productId'nin geçerli sayılar olup olmadığını kontrol et
    if (isNaN(orderItemData.orderId) || isNaN(orderItemData.productId) || isNaN(orderItemData.price)) {
      throw new Error('Geçersiz sipariş öğesi verisi');
    }
    
    const validatedData = {
      orderId: parseInt(orderItemData.orderId),
      productId: parseInt(orderItemData.productId),
      quantity: orderItemData.quantity ? parseInt(orderItemData.quantity) : 1,
      price: parseFloat(orderItemData.price)
    };
    
    return await this.OrderItem.create(validatedData);
  }
  
  async getOrderItems(orderId) {
    // orderId'nin geçerli bir sayı olup olmadığını kontrol et
    if (!orderId || isNaN(orderId)) {
      throw new Error('Geçersiz sipariş ID: ' + orderId);
    }
    
    const orderItems = await this.OrderItem.findAll({
      where: { orderId: parseInt(orderId) },
      include: [{ model: this.Product, attributes: ['id', 'name', 'price', 'category'] }],
      raw: false
    });
    
    // Include ile birlikte kullanıldığında manuel olarak serialize etmeliyiz
    return orderItems.map(item => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      Product: item.Product ? {
        id: item.Product.id,
        name: item.Product.name,
        price: item.Product.price,
        category: item.Product.category
      } : null
    }));
  }
  
  async deleteOrder(id) {
    // First delete all order items
    await this.OrderItem.destroy({ where: { orderId: id } });
    // Then delete the order
    return await this.Order.destroy({ where: { id } });
  }
  
  async deleteOrderItem(orderItemId) {
    // orderItemId'nin geçerli bir sayı olup olmadığını kontrol et
    if (!orderItemId || isNaN(orderItemId)) {
      throw new Error('Geçersiz sipariş öğesi ID: ' + orderItemId);
    }
    
    return await this.OrderItem.destroy({ where: { id: parseInt(orderItemId) } });
  }
  
  async updateOrderItemQuantity(orderItemId, quantity) {
    // Parametrelerin geçerli olup olmadığını kontrol et
    if (!orderItemId || isNaN(orderItemId) || !quantity || isNaN(quantity) || quantity < 1) {
      throw new Error('Geçersiz parametreler');
    }
    
    return await this.OrderItem.update(
      { quantity: parseInt(quantity) },
      { where: { id: parseInt(orderItemId) } }
    );
  }
  
  async updateOrderStatus(orderId, status, paymentMethod = null) {
    // orderId'nin geçerli bir sayı olup olmadığını kontrol et
    if (!orderId || isNaN(orderId)) {
      throw new Error('Geçersiz sipariş ID: ' + orderId);
    }
    
    const updateData = { status };
    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod;
    }
    
    // Calculate total amount if paying
    if (status === 'paid') {
      const orderItems = await this.getOrderItems(parseInt(orderId));
      const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      updateData.totalAmount = totalAmount;
    }
    
    return await this.Order.update(updateData, { where: { id: parseInt(orderId) } });
  }
  
  async updateOrderNote(orderId, note) {
    // orderId'nin geçerli bir sayı olup olmadığını kontrol et
    if (!orderId || isNaN(orderId)) {
      throw new Error('Geçersiz sipariş ID: ' + orderId);
    }
    
    return await this.Order.update(
      { note: note || null },
      { where: { id: parseInt(orderId) } }
    );
  }
  
  async transferOrder(orderId, newTableId) {
    // Parametrelerin geçerli olup olmadığını kontrol et
    if (!orderId || isNaN(orderId) || !newTableId || isNaN(newTableId)) {
      throw new Error('Geçersiz parametreler');
    }
    
    // Eski masa ID'sini al
    const order = await this.Order.findByPk(parseInt(orderId));
    if (!order) {
      throw new Error('Sipariş bulunamadı');
    }
    
    const oldTableId = order.tableId;
    
    // Yeni masada açık sipariş var mı kontrol et
    const existingOrder = await this.Order.findOne({
      where: {
        tableId: parseInt(newTableId),
        status: 'open'
      }
    });
    
    if (existingOrder) {
      throw new Error('Hedef masada zaten açık bir sipariş var');
    }
    
    // Siparişi yeni masaya taşı
    await this.Order.update(
      { tableId: parseInt(newTableId) },
      { where: { id: parseInt(orderId) } }
    );
    
    // Eski masayı boşalt
    await this.updateTableStatus(oldTableId, 'available');
    
    // Yeni masayı dolu yap
    await this.updateTableStatus(parseInt(newTableId), 'occupied');
    
    return { oldTableId, newTableId: parseInt(newTableId) };
  }
  
  // User operations
  async createUser(userData) {
    if (!userData || !userData.username || !userData.password || !userData.fullName) {
      throw new Error('Geçersiz kullanıcı verisi');
    }
    
    const user = await this.User.create({
      username: userData.username,
      password: userData.password, // Not: Gerçek uygulamada şifreyi hash'leyin!
      fullName: userData.fullName,
      role: userData.role || 'user'
    });
    
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role
    };
  }
  
  async authenticateUser(username, password) {
    if (!username || !password) {
      throw new Error('Kullanıcı adı ve şifre gerekli');
    }
    
    const user = await this.User.findOne({
      where: { username: username }
    });
    
    if (!user) {
      return null; // Kullanıcı bulunamadı
    }
    
    // Not: Gerçek uygulamada hash karşılaştırması yapın!
    if (user.password === password) {
      return {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role
      };
    }
    
    return null; // Şifre yanlış
  }
  
  async getUsers() {
    const users = await this.User.findAll({ raw: true });
    return users.map(u => ({
      id: u.id,
      username: u.username,
      fullName: u.full_name || u.fullName,
      role: u.role
    }));
  }
  
  async createDefaultUser() {
    // Admin kullanıcısı var mı kontrol et
    const adminExists = await this.User.findOne({ where: { username: 'admin' } });
    
    if (!adminExists) {
      await this.createUser({
        username: 'admin',
        password: 'admin123',
        fullName: 'Yönetici',
        role: 'admin'
      });
    }
  }
  
  // ==================== COURIER OPERATIONS ====================
  
  async createCourier(courierData) {
    const courier = await this.Courier.create(courierData);
    return courier.get({ plain: true });
  }
  
  async getCouriers() {
    const couriers = await this.Courier.findAll({ 
      raw: true,
      order: [['created_at', 'DESC']]
    });
    
    return couriers.map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      vehiclePlate: c.vehicle_plate || c.vehiclePlate,
      status: c.status,
      totalDeliveries: c.total_deliveries || c.totalDeliveries || 0,
      activeDeliveryId: c.active_delivery_id || c.activeDeliveryId,
      createdAt: c.created_at || c.createdAt,
      updatedAt: c.updated_at || c.updatedAt
    }));
  }
  
  async getCourierById(courierId) {
    const courier = await this.Courier.findByPk(courierId, { raw: true });
    if (!courier) return null;
    
    return {
      id: courier.id,
      name: courier.name,
      phone: courier.phone,
      vehiclePlate: courier.vehicle_plate || courier.vehiclePlate,
      status: courier.status,
      totalDeliveries: courier.total_deliveries || courier.totalDeliveries || 0,
      activeDeliveryId: courier.active_delivery_id || courier.activeDeliveryId,
      createdAt: courier.created_at || courier.createdAt,
      updatedAt: courier.updated_at || courier.updatedAt
    };
  }
  
  async updateCourier(courierId, courierData) {
    await this.Courier.update(courierData, {
      where: { id: courierId }
    });
    return await this.getCourierById(courierId);
  }
  
  async deleteCourier(courierId) {
    // Önce bu kuryenin aktif teslimatı var mı kontrol et
    const activeDeliveries = await this.Order.count({
      where: {
        courier_id: courierId,
        delivery_status: ['preparing', 'ready_for_pickup', 'picked_up', 'on_the_way']
      }
    });
    
    if (activeDeliveries > 0) {
      throw new Error('Bu kuryenin aktif teslimatı var. Önce teslimatları tamamlamalısınız.');
    }
    
    await this.Courier.destroy({
      where: { id: courierId }
    });
    
    return true;
  }
  
  async assignCourierToOrder(orderId, courierId) {
    // Kuryeyi kontrol et
    const courier = await this.Courier.findByPk(courierId);
    if (!courier) {
      throw new Error('Kurye bulunamadı');
    }
    
    // Siparişi kontrol et
    const order = await this.Order.findByPk(orderId);
    if (!order) {
      throw new Error('Sipariş bulunamadı');
    }
    
    // Siparişin zaten bir kuryesi var mı kontrol et
    if (order.courier_id && order.delivery_status !== 'delivered' && order.delivery_status !== 'cancelled') {
      throw new Error('Bu siparişe zaten bir kurye atanmış. Önce mevcut kuryeyi kaldırmalısınız.');
    }
    
    // Siparişi güncelle
    await this.Order.update({
      courier_id: courierId,
      delivery_status: 'preparing'
    }, {
      where: { id: orderId }
    });
    
    // Kuryenin durumunu güncelle
    await this.Courier.update({
      status: 'on_delivery',
      active_delivery_id: orderId
    }, {
      where: { id: courierId }
    });
    
    return true;
  }
  
  async autoAssignCourier(orderId) {
    // Siparişi kontrol et
    const order = await this.Order.findByPk(orderId);
    if (!order) {
      throw new Error('Sipariş bulunamadı');
    }
    
    // Siparişin zaten bir kuryesi var mı kontrol et
    if (order.courier_id) {
      console.log('Siparişe zaten kurye atanmış, otomatik atama yapılmadı');
      return false;
    }
    
    // Müsait kuryelerden en az teslimatı olan kuryeyi bul
    const availableCouriers = await this.Courier.findAll({
      where: { status: 'available' },
      order: [['total_deliveries', 'ASC']],
      raw: true
    });
    
    if (availableCouriers.length === 0) {
      console.log('Müsait kurye bulunamadı, otomatik atama yapılamadı');
      return false;
    }
    
    // İlk müsait kuryeyi ata
    const courier = availableCouriers[0];
    await this.assignCourierToOrder(orderId, courier.id);
    
    console.log(`Sipariş #${orderId}, otomatik olarak ${courier.name} kurye atandı`);
    return true;
  }
  
  async updateDeliveryStatus(orderId, status, note = null) {
    const order = await this.Order.findByPk(orderId);
    if (!order) {
      throw new Error('Sipariş bulunamadı');
    }
    
    const updateData = {
      delivery_status: status
    };
    
    if (note) {
      updateData.delivery_note = note;
    }
    
    // Teslimat tamamlandıysa
    if (status === 'delivered') {
      const courier = await this.Courier.findByPk(order.courier_id);
      if (courier) {
        // Kurye istatistiklerini güncelle
        await this.Courier.update({
          status: 'available',
          active_delivery_id: null,
          total_deliveries: (courier.total_deliveries || 0) + 1
        }, {
          where: { id: order.courier_id }
        });
      }
    }
    
    await this.Order.update(updateData, {
      where: { id: orderId }
    });
    
    return true;
  }
  
  async getActiveDeliveries() {
    const deliveries = await this.Order.findAll({
      where: {
        delivery_status: ['preparing', 'ready_for_pickup', 'picked_up', 'on_the_way']
      },
      include: [
        { model: this.Courier },
        { model: this.Table }
      ],
      raw: false
    });
    
    return deliveries.map(d => {
      const plain = d.get({ plain: true });
      return {
        id: plain.id,
        tableId: plain.table_id || plain.tableId,
        tableName: plain.Table?.name,
        totalAmount: plain.total_amount || plain.totalAmount,
        deliveryStatus: plain.delivery_status || plain.deliveryStatus,
        deliveryAddress: plain.delivery_address || plain.deliveryAddress,
        deliveryNote: plain.delivery_note || plain.deliveryNote,
        customerName: plain.customer_name || plain.customerName,
        customerPhone: plain.customer_phone || plain.customerPhone,
        estimatedDeliveryTime: plain.estimated_delivery_time || plain.estimatedDeliveryTime,
        courierId: plain.courier_id || plain.courierId,
        courierName: plain.Courier?.name,
        createdAt: plain.created_at || plain.createdAt
      };
    });
  }
  
  async getCourierDeliveries(courierId, startDate = null, endDate = null) {
    const whereClause = {
      courier_id: courierId,
      delivery_status: 'delivered'
    };
    
    if (startDate && endDate) {
      whereClause.created_at = {
        [this.sequelize.Sequelize.Op.between]: [startDate, endDate]
      };
    }
    
    const deliveries = await this.Order.findAll({
      where: whereClause,
      include: [{ model: this.Table }],
      raw: false,
      order: [['created_at', 'DESC']]
    });
    
    return deliveries.map(d => {
      const plain = d.get({ plain: true });
      return {
        id: plain.id,
        tableId: plain.table_id || plain.tableId,
        tableName: plain.Table?.name,
        totalAmount: plain.total_amount || plain.totalAmount,
        deliveryStatus: plain.delivery_status || plain.deliveryStatus,
        deliveryAddress: plain.delivery_address || plain.deliveryAddress,
        customerName: plain.customer_name || plain.customerName,
        customerPhone: plain.customer_phone || plain.customerPhone,
        createdAt: plain.created_at || plain.createdAt,
        updatedAt: plain.updated_at || plain.updatedAt
      };
    });
  }
}

module.exports = Database;