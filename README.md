# 🍽️ Modern POS Sistemi

Restoran ve kafeler için geliştirilmiş, dokunmatik ekran desteği olan modern bir satış noktası (POS) uygulaması.

## 📋 Özellikler

### 🏠 Dashboard
- **Anlık İstatistikler**: Toplam gelir, sipariş sayısı, ortalama hesap, ürün sayısı
- **Satış Grafikleri**: Chart.js ile interaktif grafikler
  - Bugün, Bu Hafta, Bu Ay, Tüm Zamanlar filtreleme
  - Saatlik/günlük satış takibi
  - Ödeme yöntemi dağılımı (Nakit/Kart)
- **En Çok Satan Ürünler**: Top 10 ürün listesi ve gelir analizi

### 🪑 Masa Yönetimi
- Masa ekleme ve silme
- Masa durumu takibi (Boş/Dolu)
- Sipariş detaylarını masa kartında görüntüleme
- Anlık masa durumu güncelleme

### 🍕 Ürün Yönetimi
- Ürün ekleme (isim, fiyat, kategori)
- Kategori yönetimi (dinamik kategori ekleme)
- **Arama ve Filtreleme**:
  - Canlı ürün arama
  - Kategoriye göre filtreleme
  - Fiyat/isim bazlı sıralama (A-Z, Z-A, Düşük-Yüksek)

### 📋 Sipariş Yönetimi
- Masa bazlı sipariş oluşturma
- Siparişe ürün ekleme (adet seçimi ile)
- **Sipariş Düzenleme**:
  - Ürün silme
  - Adet değiştirme
  - Sipariş notu ekleme
- Masa transfer (siparişi başka masaya taşıma - sadece boş masalara)
- Ödeme işlemleri (Nakit/Kart)
- Sipariş iptal
- Otomatik masa durumu güncelleme

### 📜 Sipariş Geçmişi
- Ödenmiş ve iptal edilmiş siparişlerin listesi
- Detaylı sipariş görüntüleme
- Toplam tutar ve ödeme yöntemi bilgisi

### 🖨️ Yazdırma Özellikleri
- **Sipariş Fişi**: Ödeme sonrası müşteri fişi (termal yazıcı formatı)
- **Mutfak Adisyonu**: Mutfak için büyük punto sipariş çıktısı
- **Z Raporu**: Gün sonu raporu
  - Toplam satış ve gelir
  - Nakit/Kart dağılımı
  - Ürün bazlı satış detayları
  - İptal edilen siparişler

### 👤 Kullanıcı Yönetimi
- Güvenli giriş sistemi
- Kullanıcı oturumu yönetimi
- Varsayılan admin hesabı
  - **Kullanıcı Adı**: admin
  - **Şifre**: admin123

### 🎨 Dokunmatik Ekran Optimizasyonu
- Büyük, dokunmaya uygun butonlar (minimum 60px)
- Geniş padding ve spacing
- Büyük fontlar ve ikonlar
- Touch feedback animasyonları
- Tek kişilik kullanım için optimize edilmiş

## 🛠️ Teknolojiler

- **Electron.js**: Masaüstü uygulama framework'ü
- **PostgreSQL**: Veritabanı (Sequelize ORM ile)
- **Bootstrap 5**: Responsive UI framework
- **jQuery**: DOM manipülasyonu
- **Chart.js**: Grafik ve istatistikler
- **SweetAlert2**: Modern bildirimler
- **Font Awesome**: İkonlar

## 📦 Kurulum

### Gereksinimler
- Node.js (v14 veya üzeri)
- PostgreSQL veritabanı

### Adımlar

1. Bağımlılıkları yükleyin:
```bash
   npm install
   ```

2. `.env` dosyası oluşturun ve veritabanı ayarlarınızı yapın:
```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pos_db
DB_USER=postgres
DB_PASSWORD=your_password
```

3. Uygulamayı başlatın:
```bash
npm start
```

Geliştirme modu (hot reload):
```bash
npm run dev
```

## 🎯 Kullanım

### İlk Giriş
1. Uygulama açıldığında giriş ekranı gelir
2. Varsayılan admin hesabı ile giriş yapın:
   - Kullanıcı Adı: `admin`
   - Şifre: `admin123`

### Temel İş Akışı

**1. Masa ve Ürün Hazırlığı**
- Masalar sekmesinden masalarınızı ekleyin
- Ürünler sekmesinden menü ürünlerinizi ekleyin
- Kategorileri organize edin

**2. Sipariş Alma**
- Sipariş Yönetimi sekmesine gidin
- Boş bir masaya "Sipariş Ver" tıklayın
- Ürünleri seçin ve adet belirtin
- Gerekirse sipariş notu ekleyin

**3. Sipariş Düzenleme**
- "Detaylar" butonuna tıklayın
- Ürün ekleyin, silin veya adet değiştirin
- Not ekleyin veya güncelleyin
- Mutfak adisyonu yazdırın

**4. Ödeme**
- "Öde" butonuna tıklayın
- Ödeme yöntemini seçin (Nakit/Kart)
- Ödeme tamamlanınca fiş yazdırabilirsiniz
- Masa otomatik olarak boşalır

**5. Raporlama**
- Dashboard'dan anlık durumu görün
- Sipariş Geçmişi'nden geçmiş siparişleri inceleyin
- Z Raporu ile gün sonu raporunu yazdırın

## 📊 Veritabanı Yapısı

### Tablolar
- **tables**: Restoran masaları
- **products**: Menü ürünleri (kategori ile)
- **orders**: Siparişler (durum, ödeme, not)
- **order_items**: Sipariş kalemleri
- **users**: Kullanıcılar (giriş sistemi)

### İlişkiler
- Order → Table (Bir sipariş bir masaya ait)
- OrderItem → Order (Sipariş kalemleri)
- OrderItem → Product (Ürün bilgileri)

## 🎨 Özelleştirme

### Renk Teması
`src/renderer/styles.css` dosyasındaki `:root` değişkenlerini düzenleyin:
```css
--primary-color: #4361ee;
--secondary-color: #3f37c9;
```

### Dokunmatik Ayarları
```css
--touch-min-height: 60px;  /* Minimum buton yüksekliği */
--touch-padding: 20px;     /* İç boşluk */
--touch-font-size: 1.1rem; /* Font boyutu */
```

## 📱 Dokunmatik Ekran Kullanımı

Sistem dokunmatik ekranlar için optimize edilmiştir:
- Tüm butonlar minimum 60px yükseklikte
- Büyük fontlar ve ikonlar
- Geniş tıklama alanları
- Touch feedback animasyonları
- Hızlı erişim için optimize edilmiş navigasyon

## 🔒 Güvenlik Notları

⚠️ **ÖNEMLİ**: Bu uygulama demo amaçlıdır. Üretim ortamı için:
- Şifreleri hash'leyin (bcrypt kullanın)
- HTTPS kullanın
- Güvenli oturum yönetimi ekleyin
- SQL injection koruması (Sequelize zaten sağlar)
- Yetki kontrolleri ekleyin

## 📝 Yapılan Geliştirmeler

### Sipariş Sistemi
- ✅ Sipariş oluşturma ve yönetimi
- ✅ Ürün ekleme/silme/düzenleme
- ✅ Adet değiştirme
- ✅ Sipariş notları
- ✅ Masa transfer
- ✅ Ödeme işlemleri

### Raporlama
- ✅ Günlük/haftalık/aylık satış raporları
- ✅ En çok satan ürünler
- ✅ Gelir grafikleri
- ✅ Ödeme yöntemi analizi
- ✅ Z raporu

### Kullanıcı Deneyimi
- ✅ Ürün arama ve filtreleme
- ✅ Modern SweetAlert2 bildirimleri
- ✅ Responsive tasarım
- ✅ Dokunmatik ekran optimizasyonu
- ✅ Kullanıcı giriş sistemi

### Yazdırma
- ✅ Sipariş fişi (termal yazıcı formatı)
- ✅ Mutfak adisyonu (büyük punto)
- ✅ Z raporu (detaylı gün sonu)

## 🚀 Geliştirme Yol Haritası

### Tamamlanan Özellikler
- [x] Masa yönetimi
- [x] Ürün yönetimi
- [x] Sipariş yönetimi
- [x] Ödeme işlemleri
- [x] Raporlama ve dashboard
- [x] Ürün arama/filtreleme
- [x] Sipariş düzenleme
- [x] Masa transfer
- [x] Yazdırma özellikleri
- [x] Kullanıcı giriş sistemi
- [x] Dokunmatik UI optimizasyonu

### Gelecek Özellikler (Opsiyonel)
- [ ] Stok yönetimi
- [ ] İndirim sistemi
- [ ] Çoklu kullanıcı rolleri
- [ ] Dark mode
- [ ] Klavye kısayolları
- [ ] Otomatik yedekleme
- [ ] Excel export

## 📄 Lisans

MIT License - Ticari kullanım için uygun

## 💡 Destek

Herhangi bir sorun yaşarsanız:
1. Veritabanı bağlantısını kontrol edin (.env dosyası)
2. PostgreSQL servisinin çalıştığından emin olun
3. Konsol loglarını kontrol edin (DevTools - F12)

## 🎓 Notlar

- Sistem tek kullanıcılı tasarlanmıştır
- Dokunmatik ekranlarda en iyi performansı verir
- Tüm tutarlar Türk Lirası (₺) cinsindendir
- Siparişler otomatik olarak veritabanına kaydedilir
