# 📦 NexStock Frontend

NexStock projesinin React tabanlı arayüzüdür.

## 🛠️ Teknolojiler
- **React**
- **Tailwind CSS**
- **Material-UI Icons**
- **Axios** (API iletişimi için)
- **Recharts** (Grafikler için)

## ⚙️ Kurulum ve Çalıştırma

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. `.env` dosyasını oluşturun:
   ```env
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   ```

3. Geliştirme modunda başlatın:
   ```bash
   npm start
   ```

## 🚀 Render Deployment
Bu repo Render'da **Static Site** olarak deploy edilmek üzere yapılandırılmıştır (`render.yaml`).
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`
