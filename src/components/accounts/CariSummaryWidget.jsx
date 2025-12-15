import React from 'react';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const CariSummaryWidget = ({
    customers = [],
    suppliers = [],
    totalReceivables: propReceivables,
    totalPayables: propPayables
}) => {
    // Use props if provided, otherwise calculate (fallback for backward compatibility if needed, 
    // but we aim to use the hook's values)

    // Calculate total receivables (customers who owe us)
    const calculatedReceivables = customers.reduce((sum, customer) => {
        const balance = customer.unpaidAmount || 0;
        return balance > 0 ? sum + balance : sum;
    }, 0);

    // Calculate total payables (suppliers we owe)
    const calculatedPayables = suppliers.reduce((sum, supplier) => {
        const balance = supplier.unpaidAmount || 0;
        return balance > 0 ? sum + balance : sum;
    }, 0);

    const totalReceivables = propReceivables !== undefined ? propReceivables : calculatedReceivables;
    const totalPayables = propPayables !== undefined ? propPayables : calculatedPayables;

    // Net position (receivables - payables)
    const netPosition = totalReceivables - totalPayables;

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Cari Hesaplar Özeti</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Alacaklar (Receivables) */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-600">Toplam Alacaklar</span>
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">
                        ₺{totalReceivables.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        Müşterilerden tahsil edilecek
                    </p>
                </div>

                {/* Borçlar (Payables) */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-red-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-600">Toplam Borçlar</span>
                        <TrendingDown className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold text-red-600">
                        ₺{totalPayables.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        Tedarikçilere ödenecek
                    </p>
                </div>

                {/* Net Durum */}
                <div className={`bg-white rounded-xl p-4 shadow-sm border ${netPosition >= 0 ? 'border-emerald-100' : 'border-red-100'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-600">Net Durum</span>
                        {netPosition >= 0 ? (
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                        ) : (
                            <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                    </div>
                    <p className={`text-2xl font-bold ${netPosition >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {netPosition >= 0 ? '+' : ''}₺{netPosition.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        {netPosition >= 0 ? 'Alacak fazlası' : 'Borç fazlası'}
                    </p>
                </div>
            </div>

            {/* Detaylı Bilgi */}
            <div className="mt-4 pt-4 border-t border-indigo-100">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-slate-600">Borçlu Müşteri Sayısı:</span>
                        <span className="ml-2 font-semibold text-slate-800">
                            {customers.filter(c => (c.unpaidAmount || 0) > 0).length}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-600">Borçlu Olduğumuz Tedarikçi:</span>
                        <span className="ml-2 font-semibold text-slate-800">
                            {suppliers.filter(s => (s.unpaidAmount || 0) > 0).length}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CariSummaryWidget;
