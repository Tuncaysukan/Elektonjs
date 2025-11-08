const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Table operations
  getTables: () => ipcRenderer.invoke('get-tables'),
  createTable: (tableName) => ipcRenderer.invoke('create-table', tableName),
  deleteTable: (tableId) => ipcRenderer.invoke('delete-table', tableId),
  updateTableStatus: (tableId, status) => ipcRenderer.invoke('update-table-status', tableId, status),
  
  // Product operations
  getProducts: () => ipcRenderer.invoke('get-products'),
  createProduct: (productData) => ipcRenderer.invoke('create-product', productData),
  updateProduct: (productId, productData) => ipcRenderer.invoke('update-product', productId, productData),
  deleteProduct: (productId) => ipcRenderer.invoke('delete-product', productId),
  
  // Order operations
  getOrders: () => ipcRenderer.invoke('get-orders'),
  createOrder: (orderData) => ipcRenderer.invoke('create-order', orderData),
  addOrderItem: (orderItemData) => ipcRenderer.invoke('add-order-item', orderItemData),
  getOrderItems: (orderId) => ipcRenderer.invoke('get-order-items', orderId),
  deleteOrder: (orderId) => ipcRenderer.invoke('delete-order', orderId),
  deleteOrderItem: (orderItemId) => ipcRenderer.invoke('delete-order-item', orderItemId),
  updateOrderItemQuantity: (orderItemId, quantity) => ipcRenderer.invoke('update-order-item-quantity', orderItemId, quantity),
  updateOrderNote: (orderId, note) => ipcRenderer.invoke('update-order-note', orderId, note),
  transferOrder: (orderId, newTableId) => ipcRenderer.invoke('transfer-order', orderId, newTableId),
  updateOrderStatus: (orderId, status, paymentMethod) => ipcRenderer.invoke('update-order-status', orderId, status, paymentMethod),
  
  // User operations
  authenticateUser: (username, password) => ipcRenderer.invoke('authenticate-user', username, password),
  getUsers: () => ipcRenderer.invoke('get-users'),
  
  // Stock operations
  updateProductStock: (productId, quantity) => ipcRenderer.invoke('update-product-stock', productId, quantity),
  decreaseProductStock: (productId, quantity) => ipcRenderer.invoke('decrease-product-stock', productId, quantity),
  getLowStockProducts: () => ipcRenderer.invoke('get-low-stock-products')
});