const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const Database = require('../database/database');

// Initialize database
const database = new Database();

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