import React, { useState, useEffect } from 'react';
import { Assessment, TrendingUp, TrendingDown, Inventory } from '@mui/icons-material';
import api from '../api';

const ReportsPage = () => {
    const [loading, setLoading] = useState(true);
    const [income, setIncome] = useState(0);
    const [expense, setExpense] = useState(0);
    const [stock, setStock] = useState([]);
    const [cashFlow, setCashFlow] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [incomeExpenseRes, stockRes, cashFlowRes] = await Promise.all([
                    api.get('/reports/income-expense'),
                    api.get('/reports/stock-movements'),
                    api.get('/reports/cash-flow')
                ]);

                setIncome(incomeExpenseRes.data.income);
                setExpense(incomeExpenseRes.data.expense);
                setStock(stockRes.data);
                setCashFlow(cashFlowRes.data);
            } catch (error) {
                console.error('Error fetching reports:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                    <Assessment className="mr-2" />
                    Raporlar
                </h2>
                <p className="text-slate-500 mt-1">Finansal ve stok raporlarınızı buradan görüntüleyebilirsiniz.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl shadow-sm border border-emerald-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-emerald-600">Toplam Gelir</p>
                            <p className="text-3xl font-bold text-emerald-900 mt-2">₺{income.toLocaleString('tr-TR')}</p>
                        </div>
                        <div className="h-12 w-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-sm border border-red-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-red-600">Toplam Gider</p>
                            <p className="text-3xl font-bold text-red-900 mt-2">₺{expense.toLocaleString('tr-TR')}</p>
                        </div>
                        <div className="h-12 w-12 bg-red-500 rounded-xl flex items-center justify-center">
                            <TrendingDown className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl shadow-sm border border-indigo-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-indigo-600">Net Kar/Zarar</p>
                            <p className={`text-3xl font-bold mt-2 ${income - expense >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>
                                ₺{(income - expense).toLocaleString('tr-TR')}
                            </p>
                        </div>
                        <div className="h-12 w-12 bg-indigo-500 rounded-xl flex items-center justify-center">
                            <Assessment className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Nakit Akışı (Son 10 İşlem)</h3>
                <div className="space-y-3">
                    {cashFlow.slice(-10).reverse().map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center">
                                <div className={`h-2 w-2 rounded-full mr-3 ${item.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                <span className="text-sm text-slate-600">{new Date(item.date).toLocaleDateString('tr-TR')}</span>
                            </div>
                            <span className={`text-sm font-medium ${item.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {item.type === 'income' ? '+' : '-'}₺{item.amount.toLocaleString('tr-TR')}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                    <Inventory className="mr-2" />
                    Stok Durumu
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {stock.map((item, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg border-2 ${item.isCritical ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-900">{item.name}</p>
                                    <p className="text-xs text-slate-500 mt-1">SKU: {item.sku}</p>
                                </div>
                                {item.isCritical && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                        Kritik!
                                    </span>
                                )}
                            </div>
                            <div className="mt-3 flex items-center justify-between text-sm">
                                <span className="text-slate-600">Stok: <strong>{item.quantity}</strong></span>
                                <span className="text-slate-600">Kritik: <strong>{item.criticalStockLevel}</strong></span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
