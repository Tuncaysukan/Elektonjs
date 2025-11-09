// Platform API servisleri
const axios = require('axios');

class PlatformService {
  constructor(database) {
    this.database = database;
    this.platforms = {
      trendyol: {
        name: 'Trendyol Go',
        baseUrl: process.env.TRENDYOL_API_URL || 'https://tgoapps-external-api.trendyol.com',
        apiKey: process.env.TRENDYOL_API_KEY || '',
        restaurantId: process.env.TRENDYOL_RESTAURANT_ID || '',
        enabled: false
      },
      yemeksepeti: {
        name: 'Yemek Sepeti',
        baseUrl: process.env.YEMEKSEPETI_API_URL || '',
        apiKey: process.env.YEMEKSEPETI_API_KEY || '',
        restaurantId: process.env.YEMEKSEPETI_RESTAURANT_ID || '',
        enabled: false
      },
      getir: {
        name: 'Getir',
        baseUrl: process.env.GETIR_API_URL || '',
        apiKey: process.env.GETIR_API_KEY || '',
        restaurantId: process.env.GETIR_RESTAURANT_ID || '',
        enabled: false
      }
    };
    
    this.checkPlatformConfigurations();
  }
  
  checkPlatformConfigurations() {
    // API key'leri kontrol et ve platformları aktif et
    Object.keys(this.platforms).forEach(platform => {
      const config = this.platforms[platform];
      if (config.apiKey && config.restaurantId) {
        config.enabled = true;
        console.log(`${config.name} entegrasyonu aktif`);
      } else {
        console.log(`${config.name} entegrasyonu pasif (API key eksik)`);
      }
    });
  }
  
  // Trendyol Go - Sipariş paketlerini çekme
  async fetchTrendyolOrders() {
    const config = this.platforms.trendyol;
    if (!config.enabled) {
      throw new Error('Trendyol entegrasyonu yapılandırılmamış');
    }
    
    try {
      const response = await axios.get(`${config.baseUrl}/packages`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          restaurantId: config.restaurantId
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Trendyol sipariş çekme hatası:', error.message);
      throw error;
    }
  }
  
  // Trendyol Go - Siparişi kabul etme
  async acceptTrendyolOrder(packageId) {
    const config = this.platforms.trendyol;
    if (!config.enabled) {
      throw new Error('Trendyol entegrasyonu yapılandırılmamış');
    }
    
    try {
      const response = await axios.post(
        `${config.baseUrl}/packages/${packageId}/accept`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Trendyol sipariş kabul hatası:', error.message);
      throw error;
    }
  }
  
  // Trendyol Go - Sipariş hazırlığı tamamlandı
  async markTrendyolOrderReady(packageId) {
    const config = this.platforms.trendyol;
    if (!config.enabled) {
      throw new Error('Trendyol entegrasyonu yapılandırılmamış');
    }
    
    try {
      const response = await axios.post(
        `${config.baseUrl}/packages/${packageId}/ready`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Trendyol sipariş hazır hatası:', error.message);
      throw error;
    }
  }
  
  // Trendyol Go - Sipariş yola çıktı
  async markTrendyolOrderDispatched(packageId) {
    const config = this.platforms.trendyol;
    if (!config.enabled) {
      throw new Error('Trendyol entegrasyonu yapılandırılmamış');
    }
    
    try {
      const response = await axios.post(
        `${config.baseUrl}/packages/${packageId}/dispatch`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Trendyol sipariş dispatch hatası:', error.message);
      throw error;
    }
  }
  
  // Trendyol Go - Sipariş teslim edildi
  async markTrendyolOrderDelivered(packageId) {
    const config = this.platforms.trendyol;
    if (!config.enabled) {
      throw new Error('Trendyol entegrasyonu yapılandırılmamış');
    }
    
    try {
      const response = await axios.post(
        `${config.baseUrl}/packages/${packageId}/deliver`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Trendyol sipariş teslim hatası:', error.message);
      throw error;
    }
  }
  
  // Trendyol Go - Sipariş iptali
  async cancelTrendyolOrder(packageId, reason) {
    const config = this.platforms.trendyol;
    if (!config.enabled) {
      throw new Error('Trendyol entegrasyonu yapılandırılmamış');
    }
    
    try {
      const response = await axios.post(
        `${config.baseUrl}/packages/${packageId}/cancel`,
        {
          reason: reason || 'Restaurant cancelled'
        },
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Trendyol sipariş iptal hatası:', error.message);
      throw error;
    }
  }
  
  // Online siparişi local sistemde oluştur
  async createOnlineOrder(platformOrderData) {
    const { platform, platformOrderId, items, customerInfo } = platformOrderData;
    
    try {
      // Online sipariş kaydı oluştur
      const onlineOrder = await this.database.OnlineOrder.create({
        platform: platform,
        platformOrderId: platformOrderId,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        deliveryAddress: customerInfo.address,
        platformStatus: 'pending',
        rawData: JSON.stringify(platformOrderData)
      });
      
      // Otomatik online masa oluştur
      const platformPrefix = platform === 'trendyol' ? 'TY' : platform === 'yemeksepeti' ? 'YS' : 'GT';
      const tableName = `${platformPrefix}-${platformOrderId}`;
      
      let table = await this.database.Table.findOne({ where: { name: tableName } });
      if (!table) {
        table = await this.database.Table.create({
          name: tableName,
          status: 'occupied'
        });
      }
      
      // Sipariş oluştur (müşteri bilgileri ile)
      const order = await this.database.createOrder({
        tableId: table.id,
        status: 'open',
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        deliveryAddress: customerInfo.address
      });
      
      // Online sipariş ile local siparişi ilişkilendir
      await this.database.OnlineOrder.update(
        { orderId: order.id },
        { where: { id: onlineOrder.id } }
      );
      
      // Sipariş ürünlerini ekle
      for (const item of items) {
        // Ürün eşleştirmesini bul
        const mapping = await this.database.ProductMapping.findOne({
          where: {
            platform: platform,
            platformProductId: item.platformProductId
          }
        });
        
        if (mapping) {
          await this.database.addOrderItem({
            orderId: order.id,
            productId: mapping.localProductId,
            quantity: item.quantity,
            price: item.price
          });
          
          // Stoktan düş
          await this.database.decreaseProductStock(mapping.localProductId, item.quantity);
        } else {
          console.warn(`Ürün eşleştirmesi bulunamadı: ${item.platformProductName}`);
        }
      }
      
      // Otomatik kurye ataması yap
      try {
        const courierAssigned = await this.database.autoAssignCourier(order.id);
        if (courierAssigned) {
          console.log(`Online sipariş #${order.id} için otomatik kurye atandı`);
        } else {
          console.log(`Online sipariş #${order.id} için kurye atanamadı (müsait kurye yok)`);
        }
      } catch (error) {
        console.error('Otomatik kurye atama hatası:', error);
        // Hata olsa bile sipariş oluşturulmuş olduğu için devam et
      }
      
      return {
        onlineOrderId: onlineOrder.id,
        orderId: order.id,
        tableId: table.id,
        tableName: tableName
      };
      
    } catch (error) {
      console.error('Online sipariş oluşturma hatası:', error);
      throw error;
    }
  }
  
  // Platformları listele
  getPlatformStatus() {
    return Object.keys(this.platforms).map(key => ({
      platform: key,
      name: this.platforms[key].name,
      enabled: this.platforms[key].enabled,
      hasApiKey: !!this.platforms[key].apiKey,
      hasRestaurantId: !!this.platforms[key].restaurantId
    }));
  }
  
  // Webhook handler (tüm platformlar için)
  async handleWebhook(platform, webhookData) {
    console.log(`${platform} webhook alındı:`, webhookData);
    
    try {
      // Webhook tipine göre işlem yap
      switch (webhookData.eventType) {
        case 'new_order':
          return await this.handleNewOrderWebhook(platform, webhookData);
        case 'order_cancelled':
          return await this.handleOrderCancelledWebhook(platform, webhookData);
        default:
          console.log(`Bilinmeyen webhook tipi: ${webhookData.eventType}`);
      }
    } catch (error) {
      console.error('Webhook işleme hatası:', error);
      throw error;
    }
  }
  
  async handleNewOrderWebhook(platform, webhookData) {
    // Yeni sipariş geldiğinde otomatik oluştur
    const orderData = this.parseWebhookData(platform, webhookData);
    return await this.createOnlineOrder(orderData);
  }
  
  async handleOrderCancelledWebhook(platform, webhookData) {
    // Platform tarafından iptal edilen siparişi güncelle
    const platformOrderId = webhookData.orderId;
    
    const onlineOrder = await this.database.OnlineOrder.findOne({
      where: {
        platform: platform,
        platformOrderId: platformOrderId
      }
    });
    
    if (onlineOrder && onlineOrder.orderId) {
      await this.database.updateOrderStatus(onlineOrder.orderId, 'cancelled');
    }
  }
  
  parseWebhookData(platform, webhookData) {
    // Platform spesifik veri formatlarını standart formata çevir
    // Bu fonksiyon her platform için özelleştirilecek
    return {
      platform: platform,
      platformOrderId: webhookData.orderId,
      items: webhookData.items || [],
      customerInfo: {
        name: webhookData.customer?.name,
        phone: webhookData.customer?.phone,
        address: webhookData.customer?.address
      }
    };
  }
}

module.exports = PlatformService;

