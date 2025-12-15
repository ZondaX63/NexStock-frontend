import React, { useEffect, useState } from 'react';
import { Close, TrendingUp, TrendingDown } from '@mui/icons-material';
import api from '../../api';

const AccountDetail = ({ open, onClose, account }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && account?._id) {
            setLoading(true);
            api.get('/transactions', { params: { account: account._id, limit: 5 } })
                .then(res => setTransactions(res.data.slice(0, 5)))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [open, account]);

    if (!open || !account) return null;

    const balanceColor = account.balance >= 0 ? 'text-emerald-600' : 'text-red-600';

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                    <div className="absolute inset-0 bg-slate-900 opacity-75"></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{account.name}</h3>
                                <p className="text-sm text-slate-500">
                                    {account.type}{account.cariType ? ` / ${account.cariType}` : ''}
                                </p>
                            </div>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
                                <Close />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-slate-500 mb-1">Bakiye</p>
                            <p className={`text-3xl font-bold ${balanceColor}`}>
                                {account.balance?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {account.currency}
                            </p>
                        </div>

                        {account.description && (
                            <div className="mb-6">
                                <p className="text-sm font-medium text-slate-700 mb-1">Açıklama</p>
                                <p className="text-sm text-slate-600">{account.description}</p>
                            </div>
                        )}

                        <div>
                            <h4 className="text-sm font-medium text-slate-700 mb-3">Son 5 İşlem</h4>
                            {loading ? (
                                <div className="flex justify-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : transactions.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">İşlem yok</p>
                            ) : (
                                <div className="space-y-2">
                                    {transactions.map(tx => (
                                        <div key={tx._id} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg">
                                            <div className="flex items-start space-x-2">
                                                {tx.type === 'income' ? (
                                                    <TrendingUp className="h-5 w-5 text-emerald-600 mt-0.5" />
                                                ) : (
                                                    <TrendingDown className="h-5 w-5 text-red-600 mt-0.5" />
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">{tx.description || '-'}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {tx.date ? new Date(tx.date).toLocaleDateString('tr-TR') : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {tx.type === 'income' ? '+' : '-'}{tx.amount?.toLocaleString('tr-TR')} TL
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            onClick={onClose}
                            className="w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none sm:w-auto sm:text-sm"
                        >
                            Kapat
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountDetail;
