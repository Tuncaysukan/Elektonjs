const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const Database = require('../database/database');
const PlatformService = require('../services/platformService');
const WebhookServer = require('../services/webhookServer');

// Initialize database
const database = new Database();

// Initialize platform services
let platformService;
let webhookServer;

// Webhook server'ı başlat (opsiyonel)
const WEBHOOK_ENABLED = process.env.WEBHOOK_ENABLED === 'true';
const WEBHOOK_PORT = process.env.WEBHOOK_PORT || 3000;

setTimeout(() => {
  platformService = new PlatformService(database);
  
  if (WEBHOOK_ENABLED) {
    webhookServer = new WebhookServer(platformService, WEBHOOK_PORT);
    webhookServer.start().catch(err => {
      console.error('Webhook server başlatılamadı:', err);
    });
  }
}, 3000);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '..', 'renderer', 'preload.js')
    }
  });

  // Load the login.html file first
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, '..', 'renderer', 'login.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  // Open DevTools for debugging
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers for database operations
ipcMain.handle('get-tables', async () => {
  return await database.getTables();
});

ipcMain.handle('create-table', async (event, tableName) => {
  return await database.createTable(tableName);
});

ipcMain.handle('delete-table', async (event, tableId) => {
  return await database.deleteTable(tableId);
});

ipcMain.handle('update-table-status', async (event, tableId, status) => {
  return await database.updateTableStatus(tableId, status);
});

ipcMain.handle('get-products', async () => {
  return await database.getProducts();
});

ipcMain.handle('create-product', async (event, productData) => {
  return await database.createProduct(productData);
});

ipcMain.handle('update-product', async (event, productId, productData) => {
  return await database.updateProduct(productId, productData);
});

ipcMain.handle('delete-product', async (event, productId) => {
  return await database.deleteProduct(productId);
});

ipcMain.handle('get-orders', async () => {
  return await database.getOrders();
});

ipcMain.handle('create-order', async (event, orderData) => {
  return await database.createOrder(orderData);
});

ipcMain.handle('add-order-item', async (event, orderItemData) => {
  return await database.addOrderItem(orderItemData);
});

ipcMain.handle('get-order-items', async (event, orderId) => {
  return await database.getOrderItems(orderId);
});

ipcMain.handle('delete-order', async (event, orderId) => {
  return await database.deleteOrder(orderId);
});

ipcMain.handle('update-order-status', async (event, orderId, status, paymentMethod) => {
  return await database.updateOrderStatus(orderId, status, paymentMethod);
});

ipcMain.handle('delete-order-item', async (event, orderItemId) => {
  return await database.deleteOrderItem(orderItemId);
});

ipcMain.handle('update-order-item-quantity', async (event, orderItemId, quantity) => {
  return await database.updateOrderItemQuantity(orderItemId, quantity);
});

ipcMain.handle('update-order-note', async (event, orderId, note) => {
  return await database.updateOrderNote(orderId, note);
});

ipcMain.handle('transfer-order', async (event, orderId, newTableId) => {
  return await database.transferOrder(orderId, newTableId);
});

ipcMain.handle('authenticate-user', async (event, username, password) => {
  return await database.authenticateUser(username, password);
});

ipcMain.handle('get-users', async (event) => {
  return await database.getUsers();
});

ipcMain.handle('update-product-stock', async (event, productId, quantity) => {
  return await database.updateProductStock(productId, quantity);
});

ipcMain.handle('decrease-product-stock', async (event, productId, quantity) => {
  return await database.decreaseProductStock(productId, quantity);
});

ipcMain.handle('get-low-stock-products', async (event) => {
  return await database.getLowStockProducts();
});

// Platform/Online sipariş API'leri
ipcMain.handle('get-platform-status', async (event) => {
  return platformService ? platformService.getPlatformStatus() : [];
});

ipcMain.handle('fetch-platform-orders', async (event, platform) => {
  if (!platformService) {
    throw new Error('Platform service henüz hazır değil');
  }
  
  switch(platform) {
    case 'trendyol':
      return await platformService.fetchTrendyolOrders();
    default:
      throw new Error('Desteklenmeyen platform');
  }
});

ipcMain.handle('accept-platform-order', async (event, platform, orderId) => {
  if (!platformService) {
    throw new Error('Platform service henüz hazır değil');
  }
  
  switch(platform) {
    case 'trendyol':
      return await platformService.acceptTrendyolOrder(orderId);
    default:
      throw new Error('Desteklenmeyen platform');
  }
});

ipcMain.handle('create-online-order', async (event, orderData) => {
  if (!platformService) {
    throw new Error('Platform service henüz hazır değil');
  }
  return await platformService.createOnlineOrder(orderData);
});

ipcMain.handle('get-online-orders', async (event) => {
  return await database.OnlineOrder.findAll({ 
    include: [{ model: database.Order }],
    raw: false 
  });
});

ipcMain.handle('get-product-mappings', async (event, platform) => {
  const where = platform ? { platform } : {};
  return await database.ProductMapping.findAll({ 
    where,
    include: [{ model: database.Product }],
    raw: false 
  });
});

ipcMain.handle('create-product-mapping', async (event, mappingData) => {
  return await database.ProductMapping.create(mappingData);
});

ipcMain.handle('delete-product-mapping', async (event, mappingId) => {
  return await database.ProductMapping.destroy({ where: { id: mappingId } });
});

// ==================== COURIER IPC HANDLERS ====================

ipcMain.handle('create-courier', async (event, courierData) => {
  return await database.createCourier(courierData);
});

ipcMain.handle('get-couriers', async (event) => {
  return await database.getCouriers();
});

ipcMain.handle('get-courier-by-id', async (event, courierId) => {
  return await database.getCourierById(courierId);
});

ipcMain.handle('update-courier', async (event, courierId, courierData) => {
  return await database.updateCourier(courierId, courierData);
});

ipcMain.handle('delete-courier', async (event, courierId) => {
  return await database.deleteCourier(courierId);
});

ipcMain.handle('assign-courier-to-order', async (event, orderId, courierId) => {
  return await database.assignCourierToOrder(orderId, courierId);
});

ipcMain.handle('update-delivery-status', async (event, orderId, status, note) => {
  return await database.updateDeliveryStatus(orderId, status, note);
});

ipcMain.handle('get-active-deliveries', async (event) => {
  return await database.getActiveDeliveries();
});

ipcMain.handle('get-courier-deliveries', async (event, courierId, startDate, endDate) => {
  return await database.getCourierDeliveries(courierId, startDate, endDate);
});

ipcMain.handle('auto-assign-courier', async (event, orderId) => {
  return await database.autoAssignCourier(orderId);
});