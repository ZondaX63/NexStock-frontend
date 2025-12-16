import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Inventory2, TrendingUp, Speed } from '@mui/icons-material';

export default function WelcomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Inventory2 className="text-4xl" />,
      title: 'Stok Yönetimi',
      description: 'Ürünlerinizi kolayca takip edin'
    },
    {
      icon: <TrendingUp className="text-4xl" />,
      title: 'Satış Analizi',
      description: 'Detaylı raporlar ve analizler'
    },
    {
      icon: <Speed className="text-4xl" />,
      title: 'Hızlı İşlem',
      description: 'Kullanıcı dostu arayüz'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="relative w-full max-w-6xl">
        <div className="text-center mb-12 animate-fade-in-down">
          {/* Logo/Brand */}
          <div className="inline-block mb-6">
            <div className="bg-white/20 backdrop-blur-lg p-6 rounded-3xl border border-white/30 shadow-2xl">
              <Inventory2 className="text-white text-6xl" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg">
            NexStock
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            İşletmeniz için modern ve akıllı çözüm
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={() => navigate('/login')}
              className="group relative px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 min-w-[200px]"
            >
              <span className="relative z-10 transition-opacity duration-300 group-hover:opacity-0">Giriş Yap</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-semibold pointer-events-none">
                Giriş Yap →
              </span>
            </button>

            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white/10 backdrop-blur-lg text-white border-2 border-white/30 rounded-xl font-semibold text-lg shadow-xl hover:bg-white/20 hover:border-white/50 transform hover:scale-105 transition-all duration-300 min-w-[200px]"
            >
              Kayıt Ol
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-white mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-white/80">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-white/60 text-sm">
            © 2024 NexStock. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  );
}
