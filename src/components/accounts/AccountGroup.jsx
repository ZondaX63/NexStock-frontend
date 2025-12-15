import React from 'react';
import { Add } from '@mui/icons-material';
import AccountCard from './AccountCard';

const AccountGroup = ({ title, accounts, onAdd, onEdit, onDelete, onDetail, onTransfer }) => {
    const total = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    const totalColor = total >= 0 ? 'text-emerald-600' : 'text-red-600';

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                    <p className={`text-sm font-semibold ${totalColor}`}>
                        Toplam: {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </p>
                </div>
                <button
                    onClick={onAdd}
                    className="inline-flex items-center px-3 py-2 border border-indigo-600 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-50 transition-colors"
                >
                    <Add className="h-4 w-4 mr-1" />
                    Yeni
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {accounts.map(acc => (
                    <AccountCard
                        key={acc._id}
                        account={acc}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onDetail={onDetail}
                        onTransfer={onTransfer}
                    />
                ))}
            </div>
        </div>
    );
};

export default AccountGroup;
