# StokTakip Client (Frontend)

StokTakip, küçük ve orta ölçekli işletmeler için geliştirilmiş kapsamlı bir stok, muhasebe ve cari yönetim uygulamasıdır. Bu repo, uygulamanın React tabanlı frontend (kullanıcı arayüzü) kısmını içerir.

## Özellikler

- Stok ve ürün yönetimi
- Cari (müşteri/tedarikçi) ve hesap kartları yönetimi
- Fatura ve işlem geçmişi
- Kasa ve finansal raporlar
- Dashboard ve analitik kartlar
- Hızlı işlem ve transfer dialogları
- Tema yönetimi (Açık/Koyu)
- Gelişmiş filtreleme, arama ve raporlama
- Bildirim ve loglama sistemi
- Responsive ve modern kullanıcı arayüzü

## Kullanılan Teknolojiler

- React (Create React App)
- Context API ile tema ve global state yönetimi
- Material-UI (veya styled-components)
- Axios ile API entegrasyonu
- Chart.js veya benzeri grafik kütüphaneleri

## Kurulum

1. Gerekli bağımlılıkları yükleyin:
   ```sh
   npm install
   ```
2. Geliştirme sunucusunu başlatın:
   ```sh
   npm start
   ```
   Uygulama varsayılan olarak [http://localhost:3000](http://localhost:3000) adresinde çalışır.

> **Not:** Backend (server) tarafı da çalışıyor olmalıdır. API istekleri için varsayılan olarak `http://localhost:5000` kullanılır.

## Komutlar

- `npm start` – Geliştirme sunucusunu başlatır
- `npm run build` – Üretim için derler
- `npm test` – Testleri çalıştırır

## Klasör Yapısı

```
StokTakip-client/
  src/
    api.js              # API istekleri
    components/         # Ortak UI bileşenleri
    contexts/           # Tema ve global contextler
    pages/              # Sayfa bazlı bileşenler
    theme/              # Tema dosyaları
    App.js              # Ana uygulama
    index.js            # Giriş noktası
```

## Geliştirici Notları

- API endpointleri ve veri modelleri için backend dokümantasyonuna bakınız.
- Ortak stiller ve tema yönetimi için `contexts/ThemeContext.js` ve `theme/theme.js` dosyalarını inceleyin.
- Responsive tasarım ve grid yapısı için Material-UI veya styled-components kullanılmıştır.

## Katkı Sağlama

Katkıda bulunmak için lütfen bir fork oluşturun, değişikliklerinizi ayrı bir branch'te yapın ve pull request gönderin.

## Sıkça Sorulan Sorular (SSS)

**S: Backend olmadan çalışır mı?**
C: Hayır, API istekleri için backend gereklidir.

**S: Tema nasıl değiştirilir?**
C: Sağ üstteki tema butonunu kullanabilirsiniz.

## Lisans

MIT

# StokTakip Frontend (client)

React tabanlı web arayüzü.

## Kurulum
```bash
npm install
npm start
```

## Özellikler
- Material-UI
- Context API
- Responsive tasarım

