import React, { useState, useEffect } from 'react';
import { Close, AccountBalanceWallet } from '@mui/icons-material';
import api from '../api';

const PaymentModal = ({ isOpen, onClose, onConfirm, type, invoice, maxAmount }) => {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [amount, setAmount] = useState(maxAmount || 0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchAccounts();
            setAmount(maxAmount || 0);
        }
    }, [isOpen, maxAmount]);

    const fetchAccounts = async () => {
        try {
            const res = await api.get('/accounts');
            // Filter for liquid assets (Cash, Bank)
            const liquidAccounts = (res.data || []).filter(acc =>
                ['cash', 'bank', 'credit_card'].includes(acc.type)
            );
            setAccounts(liquidAccounts);
            if (liquidAccounts.length > 0) {
                setSelectedAccount(liquidAccounts[0]._id);
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAccount || amount <= 0) return;

        setLoading(true);
        try {
            await onConfirm(selectedAccount, Number(amount));
            onClose();
        } catch (error) {
            console.error('Payment error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const isCollection = type === 'collection';
    const title = isCollection ? 'Tahsilat Al' : 'Ödeme Yap';
    const buttonColor = isCollection ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700';

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-slate-900 opacity-75" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg leading-6 font-bold text-slate-900 flex items-center">
                                <AccountBalanceWallet className="mr-2 text-slate-500" />
                                {title}
                            </h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
                                <Close />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Kasa / Banka Hesabı
                                </label>
                                <select
                                    value={selectedAccount}
                                    onChange={(e) => setSelectedAccount(e.target.value)}
                                    className="block w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                >
                                    {accounts.map(acc => (
                                        <option key={acc._id} value={acc._id}>
                                            {acc.name} ({acc.balance} {acc.currency})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Tutar
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-slate-500 sm:text-sm">₺</span>
                                    </div>
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        max={maxAmount}
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="block w-full pl-7 pr-12 border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-slate-500 sm:text-sm">TRY</span>
                                    </div>
                                </div>
                                <p className="mt-1 text-xs text-slate-500">
                                    Kalan Tutar: {maxAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TRY
                                </p>
                            </div>

                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:col-start-2 sm:text-sm ${buttonColor} ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'İşleniyor...' : 'Onayla'}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                >
                                    İptal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
