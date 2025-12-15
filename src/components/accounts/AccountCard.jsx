import React from 'react';
import { Edit, Delete, Info, SwapHoriz, AccountBalance, CreditCard, AttachMoney, Person } from '@mui/icons-material';

const AccountCard = ({ account, onEdit, onDelete, onDetail, onTransfer }) => {
    const getAccountIcon = (type) => {
        switch (type) {
            case 'bank': return <AccountBalance className="h-6 w-6" />;
            case 'credit_card': return <CreditCard className="h-6 w-6" />;
            case 'cash': return <AttachMoney className="h-6 w-6" />;
            case 'personnel': return <Person className="h-6 w-6" />;
            default: return <AccountBalance className="h-6 w-6" />;
        }
    };

    const getAccountTypeLabel = (type) => {
        const labels = {
            cash: 'Kasa',
            bank: 'Banka',
            credit_card: 'Kredi Kartı',
            personnel: 'Personel',
            cari: 'Cari'
        };
        return labels[type] || type;
    };

    const balanceColor = account.balance >= 0 ? 'text-emerald-600' : 'text-red-600';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                        {getAccountIcon(account.type)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 text-sm">{account.name}</h3>
                        <span className="text-xs text-slate-500">{getAccountTypeLabel(account.type)}</span>
                    </div>
                </div>
            </div>

            <div className="mb-3">
                <p className="text-xs text-slate-500 mb-1">Bakiye</p>
                <p className={`text-xl font-bold ${balanceColor}`}>
                    {account.balance?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {account.currency || 'TRY'}
                </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                    onClick={() => onDetail(account)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                    title="Detaylar"
                >
                    <Info className="h-4 w-4" />
                </button>
                <button
                    onClick={() => onTransfer(account)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Transfer"
                >
                    <SwapHoriz className="h-4 w-4" />
                </button>
                <button
                    onClick={() => onEdit(account)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                    title="Düzenle"
                >
                    <Edit className="h-4 w-4" />
                </button>
                <button
                    onClick={() => onDelete(account)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Sil"
                >
                    <Delete className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default AccountCard;
