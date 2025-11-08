// Webhook dinleyici server
const express = require('express');
const bodyParser = require('body-parser');

class WebhookServer {
  constructor(platformService, port = 3000) {
    this.platformService = platformService;
    this.port = port;
    this.app = express();
    this.server = null;
    
    this.setupMiddleware();
    this.setupRoutes();
  }
  
  setupMiddleware() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    
    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      next();
    });
  }
  
  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', message: 'Webhook server çalışıyor' });
    });
    
    // Trendyol webhook
    this.app.post('/webhook/trendyol', async (req, res) => {
      try {
        console.log('Trendyol webhook alındı:', req.body);
        
        // Webhook signature kontrolü (güvenlik)
        // const signature = req.headers['x-trendyol-signature'];
        // if (!this.verifyTrendyolSignature(signature, req.body)) {
        //   return res.status(401).json({ error: 'Invalid signature' });
        // }
        
        await this.platformService.handleWebhook('trendyol', req.body);
        res.json({ success: true });
      } catch (error) {
        console.error('Trendyol webhook error:', error);
        res.status(500).json({ error: error.message });
      }
    });
    
    // Yemeksepeti webhook
    this.app.post('/webhook/yemeksepeti', async (req, res) => {
      try {
        console.log('Yemeksepeti webhook alındı:', req.body);
        await this.platformService.handleWebhook('yemeksepeti', req.body);
        res.json({ success: true });
      } catch (error) {
        console.error('Yemeksepeti webhook error:', error);
        res.status(500).json({ error: error.message });
      }
    });
    
    // Getir webhook
    this.app.post('/webhook/getir', async (req, res) => {
      try {
        console.log('Getir webhook alındı:', req.body);
        await this.platformService.handleWebhook('getir', req.body);
        res.json({ success: true });
      } catch (error) {
        console.error('Getir webhook error:', error);
        res.status(500).json({ error: error.message });
      }
    });
    
    // Manuel sipariş çekme (polling için)
    this.app.post('/api/fetch-orders/:platform', async (req, res) => {
      try {
        const platform = req.params.platform;
        let orders;
        
        switch(platform) {
          case 'trendyol':
            orders = await this.platformService.fetchTrendyolOrders();
            break;
          default:
            return res.status(400).json({ error: 'Geçersiz platform' });
        }
        
        res.json({ success: true, orders });
      } catch (error) {
        console.error('Sipariş çekme hatası:', error);
        res.status(500).json({ error: error.message });
      }
    });
  }
  
  start() {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.port, () => {
          console.log(`✅ Webhook server ${this.port} portunda çalışıyor`);
          console.log(`   Trendyol: http://localhost:${this.port}/webhook/trendyol`);
          console.log(`   Yemeksepeti: http://localhost:${this.port}/webhook/yemeksepeti`);
          console.log(`   Getir: http://localhost:${this.port}/webhook/getir`);
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  
  stop() {
    if (this.server) {
      this.server.close();
      console.log('Webhook server kapatıldı');
    }
  }
}

module.exports = WebhookServer;

