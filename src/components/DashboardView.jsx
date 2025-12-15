import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AccountBalanceWallet,
    TrendingUp,
    TrendingDown,
    Warning,
    Add,
    Inventory,
    People,
    ArrowForward,
    CheckCircle,
    Assessment as AssessmentIcon
} from '@mui/icons-material';
import KPICard from './KPICard';
import api from '../api';

const DashboardView = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpense: 0,
        criticalStockCount: 0,
        warnings: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [accountsRes, summaryRes, dueInvoicesRes] = await Promise.all([
                    api.get('/accounts'),
                    api.get('/dashboard/summary'),
                    api.get('/invoices/due-soon')
                ]);

                const accounts = accountsRes.data || [];
                const summary = summaryRes.data || {};
                const dueInvoices = dueInvoicesRes.data || [];

                const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
                const monthlyIncome = summary.monthly?.current?.income || 0;
                const monthlyExpense = summary.monthly?.current?.expense || 0;
                const criticalStockCount = summary.criticalStocks?.length || 0;

                // Map warnings
                const warnings = [];

                // Add due invoices to warnings
                if (Array.isArray(dueInvoices)) {
                    dueInvoices.forEach(inv => {
                        warnings.push({
                            id: `inv-${inv._id}`,
                            type: 'invoice',
                            message: `Fatura #${inv.invoiceNumber} ödeme bekliyor`,
                            date: new Date(inv.dueDate).toLocaleDateString('tr-TR'),
                            severity: 'high'
                        });
                    });
                }

                // Add critical stock to warnings (limit to 5)
                if (Array.isArray(summary.criticalStocks)) {
                    summary.criticalStocks.slice(0, 5).forEach(stock => {
                        warnings.push({
                            id: `stock-${stock._id}`,
                            type: 'stock',
                            message: `${stock.name} stok kritik seviyede (${stock.quantity} ${stock.unit})`,
                            date: new Date().toLocaleDateString('tr-TR'),
                            severity: 'medium'
                        });
                    });
                }

                setStats({
                    totalBalance,
                    monthlyIncome,
                    monthlyExpense,
                    criticalStockCount,
                    warnings
                });
            } catch (error) {
                console.error('Dashboard data fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const kpiData = [
        {
            title: 'Toplam Cari Bakiye',
            value: `₺${stats.totalBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
            trend: '+0%', // Dynamic trend calculation requires historical data not yet available
            isPositive: true,
            icon: <AccountBalanceWallet />
        },
        {
            title: 'Kritik Stok',
            value: `${stats.criticalStockCount} Ürün`,
            trend: '0',
            isPositive: false,
            icon: <Warning />,
            isWarning: true
        },
        {
            title: 'Aylık Gelir',
            value: `₺${stats.monthlyIncome.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
            trend: '+0%',
            isPositive: true,
            icon: <TrendingUp />
        },
        {
            title: 'Aylık Gider',
            value: `₺${stats.monthlyExpense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
            trend: '-0%',
            isPositive: true,
            icon: <TrendingDown />
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Genel Bakış</h2>
                <p className="text-slate-500 mt-1">Hoş geldiniz, işletmenizin güncel durumu burada.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {kpiData.map((kpi, index) => (
                    <KPICard key={index} {...kpi} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Placeholder */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Finansal Analiz</h3>
                            <p className="text-sm text-slate-500">Aylık gelir ve gider dağılımı</p>
                        </div>
                        <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium bg-indigo-50 px-4 py-2 rounded-lg transition-colors">
                            Detaylı Rapor
                        </button>
                    </div>
                    <div className="h-80 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 group hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer">
                        <AssessmentIcon style={{ fontSize: 48, opacity: 0.5 }} />
                        <span className="mt-2 font-medium">Grafik Alanı (Recharts Entegrasyonu)</span>
                    </div>
                </div>

                {/* Warnings List */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-800">Kritik Bildirimler</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">
                            {stats.warnings.length} Yeni
                        </span>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {stats.warnings.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-4">Bildirim bulunmuyor.</p>
                        ) : (
                            stats.warnings.map((warning) => (
                                <div key={warning.id} className="flex items-start p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100">
                                    <div className="flex-shrink-0 mt-0.5">
                                        {warning.severity === 'high' ? (
                                            <div className="p-2 bg-red-100 rounded-lg">
                                                <Warning className="h-5 w-5 text-red-500" />
                                            </div>
                                        ) : (
                                            <div className="p-2 bg-amber-100 rounded-lg">
                                                <CheckCircle className="h-5 w-5 text-amber-500" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-semibold text-slate-900">{warning.type === 'invoice' ? 'Fatura Uyarısı' : 'Stok Uyarısı'}</h4>
                                            <span className="text-xs font-medium text-slate-400">{warning.date}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">{warning.message}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <button className="w-full mt-6 py-3 text-sm font-medium text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors">
                        Tüm Bildirimleri Gör
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Hızlı İşlemler</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <button
                        onClick={() => navigate('/panel/invoices')}
                        className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 group"
                    >
                        <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Add className="h-6 w-6" />
                        </div>
                        <span className="mt-3 font-semibold text-slate-700 group-hover:text-indigo-600">Yeni Fatura</span>
                    </button>

                    <button
                        onClick={() => navigate('/panel/products')}
                        className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300 group"
                    >
                        <div className="h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <Inventory className="h-6 w-6" />
                        </div>
                        <span className="mt-3 font-semibold text-slate-700 group-hover:text-emerald-600">Stok Girişi</span>
                    </button>

                    <button
                        onClick={() => navigate('/panel/customers')}
                        className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 group"
                    >
                        <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <People className="h-6 w-6" />
                        </div>
                        <span className="mt-3 font-semibold text-slate-700 group-hover:text-blue-600">Yeni Cari</span>
                    </button>

                    <button
                        onClick={() => navigate('/panel/account')}
                        className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-purple-200 hover:-translate-y-1 transition-all duration-300 group"
                    >
                        <div className="h-12 w-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <ArrowForward className="h-6 w-6" />
                        </div>
                        <span className="mt-3 font-semibold text-slate-700 group-hover:text-purple-600">Hızlı Transfer</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
