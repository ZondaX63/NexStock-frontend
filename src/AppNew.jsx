import React, { useState } from 'react';
import Layout from './components/modern/Layout';
import DashboardView from './components/modern/DashboardView';

const PlaceholderModule = ({ title }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">{title} Modülü</h2>
        <p className="text-slate-500">Bu modül geliştirme aşamasındadır.</p>
    </div>
);

function AppNew() {
    const [activeModule, setActiveModule] = useState('dashboard');

    const renderContent = () => {
        switch (activeModule) {
            case 'dashboard': return <DashboardView />;
            case 'stock': return <PlaceholderModule title="Stok Yönetimi" />;
            case 'cari': return <PlaceholderModule title="Cari Hesaplar" />;
            case 'finance': return <PlaceholderModule title="Muhasebe & Finans" />;
            case 'offers': return <PlaceholderModule title="Teklifler" />;
            case 'orders': return <PlaceholderModule title="Siparişler" />;
            default: return <DashboardView />;
        }
    };

    return (
        <Layout activeModule={activeModule} setActiveModule={setActiveModule}>
            {renderContent()}
        </Layout>
    );
}

export default AppNew;
