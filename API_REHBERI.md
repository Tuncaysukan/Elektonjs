# 🚀 Online Sipariş Entegrasyonu - API Rehberi

## 📋 Gerekli Adımlar

### 1️⃣ Trendyol Go API Key Alma

**Adımlar:**
1. [Trendyol Restoran Paneli](https://restaurant.trendyolgo.com)'ne giriş yap
2. **Ayarlar** → **Entegrasyonlar** bölümüne git
3. **API Anahtarı Oluştur** butonuna tıkla
4. Şunları kaydet:
   - API Key
   - Restaurant ID
   - Webhook Secret

**Döküman:** [Trendyol Go Developer Docs](https://developers.tgoapps.com/docs/trendyol-go-yemek-entegrasyonu/)

### 2️⃣ Yemeksepeti API Key Alma

**Adımlar:**
1. [Yemeksepeti Restoran Paneli](https://restoran.yemeksepeti.com)'ne giriş yap
2. **Ayarlar** → **Entegrasyon** → **API** bölümüne git
3. API anahtarını oluştur
4. Şunları kaydet:
   - API Key
   - Restaurant ID
   - Secret Key

**Döküman:** [Yemeksepeti Integration](https://integration.yemeksepeti.com/)

### 3️⃣ Getir API Key Alma

**Adımlar:**
1. [Getir İşletme Paneli](https://partner.getir.com)'ne giriş yap
2. **Ayarlar** → **API Entegrasyonu** bölümüne git
3. API anahtarını oluştur
4. Şunları kaydet:
   - API Key
   - Restaurant ID

**Döküman:** [Getir Developer Docs](https://developers.develop.getirapi.com/food/documentation/)

---

## 🔧 Konfigürasyon

### .env Dosyası Düzenleme

`.env` dosyanızı açın ve şu bilgileri ekleyin:

```env
# Trendyol Go
TRENDYOL_API_URL=https://tgoapps-external-api.trendyol.com
TRENDYOL_API_KEY=buraya_api_key_yapistir
TRENDYOL_RESTAURANT_ID=buraya_restaurant_id_yapistir
TRENDYOL_WEBHOOK_SECRET=buraya_webhook_secret_yapistir

# Yemeksepeti
YEMEKSEPETI_API_URL=https://integration.yemeksepeti.com/api/v1
YEMEKSEPETI_API_KEY=buraya_api_key_yapistir
YEMEKSEPETI_RESTAURANT_ID=buraya_restaurant_id_yapistir
YEMEKSEPETI_WEBHOOK_SECRET=buraya_webhook_secret_yapistir

# Getir
GETIR_API_URL=https://api.getir.com/food/v1
GETIR_API_KEY=buraya_api_key_yapistir
GETIR_RESTAURANT_ID=buraya_restaurant_id_yapistir
GETIR_WEBHOOK_SECRET=buraya_webhook_secret_yapistir

# Webhook Server (Otomatik sipariş için)
WEBHOOK_ENABLED=true
WEBHOOK_PORT=3000
```

---

## 🔄 Webhook Kurulumu

### Ngrok ile Public URL Oluşturma (Test için)

1. [Ngrok](https://ngrok.com/) indir ve kur
2. Terminal'de çalıştır:
```bash
ngrok http 3000
```

3. Çıkan URL'i kaydet (örn: `https://abc123.ngrok.io`)

### Webhook URL'lerini Platform Panellerinde Kaydet

**Trendyol:**
- URL: `https://abc123.ngrok.io/webhook/trendyol`

**Yemeksepeti:**
- URL: `https://abc123.ngrok.io/webhook/yemeksepeti`

**Getir:**
- URL: `https://abc123.ngrok.io/webhook/getir`

---

## 🎯 Nasıl Çalışacak?

### Otomatik Mod (Webhook ile)
1. Platform'dan yeni sipariş gelir
2. Webhook bizim sunucuya POST yapar
3. Sipariş otomatik oluşturulur
4. "TY-12345" gibi sanal masa açılır
5. Ürünler eşleştirilir ve eklenir
6. Stok otomatik düşer
7. Bildiri gelir

### Manuel Mod (Polling ile)
1. "Online Siparişler" sekmesine gir
2. "Yeni Siparişleri Çek" butonuna tıkla
3. Bekleyen siparişler listelenir
4. "Kabul Et" dersen sisteme eklenir

---

## 📊 Ürün Eşleştirme

Platform'daki ürünler ile bizim sistemdeki ürünler eşleştirilmeli:

**Örnek:**
- Trendyol'da: "Etli Dürüm (Büyük)"
- Bizim sistemde: "Et Dürüm"

UI'dan eşleştirme yapılabilecek.

---

## 🎨 Yeni Özellikler

### UI'da:
- ✅ "Online Siparişler" sekmesi
- ✅ Platform durumu göstergesi
- ✅ Yeni sipariş çekme butonu
- ✅ Ürün eşleştirme ekranı
- ✅ Platform bazlı raporlama

### Veritabanı:
- ✅ `online_orders` tablosu
- ✅ `product_mappings` tablosu
- ✅ Platform bilgileri

### API:
- ✅ Sipariş çekme
- ✅ Sipariş kabul etme
- ✅ Durum güncelleme (hazır, yola çıktı, teslim)
- ✅ İptal etme

---

## ⚠️ Önemli Notlar

1. **Test Modu**: İlk önce test ortamında deneyin
2. **Ngrok**: Üretimde gerçek domain kullanın
3. **Güvenlik**: Webhook signature doğrulaması yapın
4. **Hata Yönetimi**: API hataları loglayın

---

Hazırlıklar tamam! API key'leri ekleyince test edebiliriz 🚀

