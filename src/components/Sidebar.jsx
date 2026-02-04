import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Dashboard,
    Inventory,
    People,
    AccountBalanceWallet,
    Settings,
    Logout,
    Assessment,
    ExpandMore,
    ExpandLess,
    SupervisorAccount,
    ShoppingCart
} from '@mui/icons-material';

const Sidebar = ({ isOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [expandedSections, setExpandedSections] = useState({});

    const menuItems = [
        { id: 'dashboard', label: 'Anasayfa', icon: <Dashboard />, path: '/panel' },
        { id: 'sales', label: 'Perakende', icon: <ShoppingCart />, path: '/panel/sales' },
        {
            id: 'stock',
            label: 'Stok Yönetimi',
            icon: <Inventory />,
            children: [
                { id: 'products', label: 'Ürünler', path: '/panel/products' },
                { id: 'brands', label: 'Markalar', path: '/panel/brands' },
                { id: 'categories', label: 'Kategoriler', path: '/panel/categories' }
            ]
        },
        {
            id: 'cari',
            label: 'Cari Hesaplar',
            icon: <People />,
            children: [
                { id: 'customers', label: 'Müşteriler', path: '/panel/customers' },
                { id: 'suppliers', label: 'Tedarikçiler', path: '/panel/suppliers' },
                { id: 'cari-all', label: 'Tüm Cari Hesaplar', path: '/panel/cari' }
            ]
        },
        {
            id: 'finance',
            label: 'Muhasebe & Finans',
            icon: <AccountBalanceWallet />,
            children: [
                { id: 'invoices', label: 'Faturalar', path: '/panel/invoices' },
                { id: 'offers', label: 'Teklifler', path: '/panel/offers' },
                { id: 'orders', label: 'Siparişler', path: '/panel/orders' },
                { id: 'account', label: 'Hesap Yönetimi', path: '/panel/account' }
            ]
        },
        { id: 'reports', label: 'Raporlar', icon: <Assessment />, path: '/panel/reports' },
        { id: 'personnel', label: 'Personel', icon: <SupervisorAccount />, path: '/panel/personnel' }
    ];

    const isActive = (path) => {
        if (path === '/panel' && location.pathname === '/panel') return true;
        if (path !== '/panel' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className={`fixed inset-y-0 left-0 z-30 w-72 bg-slate-900 text-white transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 shadow-2xl flex flex-col`}>
            <div className="flex items-center justify-center h-20 bg-slate-900 border-b border-slate-800 shrink-0">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">N</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">NEX<span className="text-indigo-400">STOCK</span></h1>
                </div>
            </div>

            <nav className="mt-8 px-4 space-y-2 flex-1 overflow-y-auto">
                {menuItems.map((item) => (
                    <div key={item.id}>
                        {item.children ? (
                            <>
                                <button
                                    onClick={() => toggleSection(item.id)}
                                    className="group flex items-center justify-between px-4 py-3.5 text-sm font-medium rounded-xl w-full text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200"
                                >
                                    <div className="flex items-center">
                                        <span className="mr-4 flex-shrink-0 text-slate-500 group-hover:text-white transition-colors">
                                            {item.icon}
                                        </span>
                                        {item.label}
                                    </div>
                                    {expandedSections[item.id] ? <ExpandLess /> : <ExpandMore />}
                                </button>
                                {expandedSections[item.id] && (
                                    <div className="ml-4 mt-1 space-y-1">
                                        {item.children.map((child) => (
                                            <button
                                                key={child.id}
                                                onClick={() => navigate(child.path)}
                                                className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg w-full transition-all duration-200 ${isActive(child.path)
                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                                    }`}
                                            >
                                                {child.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <button
                                onClick={() => navigate(item.path)}
                                className={`group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl w-full transition-all duration-200 ease-in-out ${isActive(item.path)
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <span className={`mr-4 flex-shrink-0 transition-colors ${isActive(item.path) ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>
                                    {item.icon}
                                </span>
                                {item.label}
                            </button>
                        )}
                    </div>
                ))}
            </nav>

            <div className="p-6 bg-slate-900 border-t border-slate-800 shrink-0">
                <button
                    onClick={() => navigate('/panel/settings')}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-400 rounded-xl hover:bg-slate-800 hover:text-white transition-colors"
                >
                    <Settings className="mr-3 h-5 w-5" />
                    Ayarlar
                </button>
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 mt-2 text-sm font-medium text-red-400 rounded-xl hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                    <Logout className="mr-3 h-5 w-5" />
                    Çıkış Yap
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
