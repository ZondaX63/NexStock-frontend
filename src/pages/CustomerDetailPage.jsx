import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowBack,
    Add,
    Edit,
    Delete,
    Receipt,
    AttachMoney,
    TrendingUp,
    TrendingDown,
    Description
} from '@mui/icons-material';
import api from '../api';

const CustomerDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [customer, setCustomer] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('transactions'); // transactions, invoices, offers
    const [showAddModal, setShowAddModal] = useState(false);
    const [modalType, setModalType] = useState(''); // payment, debt, invoice

    const fetchCustomerDetails = useCallback(async () => {
        try {
            setLoading(true);
            const [customerRes, transactionsRes, invoicesRes, offersRes] = await Promise.all([
                api.get(`/customers/${id}`),
                api.get(`/transactions?customer=${id}`),
                api.get(`/invoices?customer=${id}`),
                api.get(`/offers?customer=${id}`)
            ]);
            
            setCustomer(customerRes.data);
            setTransactions(transactionsRes.data || []);
            setInvoices(invoicesRes.data.invoices || invoicesRes.data || []);
            setOffers(offersRes.data.offers || offersRes.data || []);
        } catch (err) {
            console.error('Error fetching customer details:', err);
            alert('Cari detayları yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchCustomerDetails();
    }, [fetchCustomerDetails]);

    const handleAddTransaction = (type) => {
        setModalType(type);
        setShowAddModal(true);
    };

    const handleDeleteTransaction = async (transactionId) => {
        if (!window.confirm('Bu işlemi silmek istediğinize emin misiniz?')) return;
        
        try {
            await api.delete(`/transactions/${transactionId}`);
            alert('İşlem silindi');
            fetchCustomerDetails();
        } catch (err) {
            console.error('Error deleting transaction:', err);
            alert(err.response?.data?.error || 'İşlem silinirken hata oluştu');
        }
    };

    const handleDeleteInvoice = async (invoiceId) => {
        if (!window.confirm('Bu faturayı silmek istediğinize emin misiniz?')) return;
        
        try {
            await api.delete(`/invoices/${invoiceId}`);
            alert('Fatura silindi');
            fetchCustomerDetails();
        } catch (err) {
            console.error('Error deleting invoice:', err);
            alert('Fatura silinirken hata oluştu');
        }
    };

    const handleDeleteOffer = async (offerId) => {
        if (!window.confirm('Bu teklifi silmek istediğinize emin misiniz?')) return;
        
        try {
            await api.delete(`/offers/${offerId}`);
            alert('Teklif silindi');
            fetchCustomerDetails();
        } catch (err) {
            console.error('Error deleting offer:', err);
            alert('Teklif silinirken hata oluştu');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-600">Cari hesap bulunamadı</p>
                <button onClick={() => navigate('/panel/customers')} className="mt-4 text-indigo-600 hover:text-indigo-700">
                    Cari Hesaplar Sayfasına Dön
                </button>
            </div>
        );
    }

    const balance = customer.balance || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/panel/customers')}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ArrowBack className="text-slate-600 dark:text-slate-400" />
                </button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{customer.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        {customer.type === 'supplier' ? 'Tedarikçi' : 'Müşteri'} Detayı
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Bakiye Durumu</p>
                            <p className={`text-2xl font-bold mt-1 ${balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                                {balance.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                {balance > 0 ? 'Alacak (Müşteri Borçlu)' : balance < 0 ? 'Verecek (Biz Borçluyuz)' : 'Hesap Kapalı'}
                            </p>
                        </div>
                        {balance > 0 ? (
                            <TrendingUp className="h-12 w-12 text-green-600 opacity-20" />
                        ) : balance < 0 ? (
                            <TrendingDown className="h-12 w-12 text-red-600 opacity-20" />
                        ) : (
                            <AttachMoney className="h-12 w-12 text-slate-400 opacity-20" />
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Toplam Fatura</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{invoices.length}</p>
                        </div>
                        <Receipt className="h-12 w-12 text-indigo-600 opacity-20" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Toplam İşlem</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{transactions.length}</p>
                        </div>
                        <Description className="h-12 w-12 text-purple-600 opacity-20" />
                    </div>
                </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">İletişim Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {customer.email && (
                        <div>
                            <span className="text-slate-500 dark:text-slate-400">E-posta:</span>
                            <span className="ml-2 text-slate-900 dark:text-slate-100">{customer.email}</span>
                        </div>
                    )}
                    {customer.phone && (
                        <div>
                            <span className="text-slate-500 dark:text-slate-400">Telefon:</span>
                            <span className="ml-2 text-slate-900 dark:text-slate-100">{customer.phone}</span>
                        </div>
                    )}
                    {customer.address && (
                        <div className="md:col-span-2">
                            <span className="text-slate-500 dark:text-slate-400">Adres:</span>
                            <span className="ml-2 text-slate-900 dark:text-slate-100">{customer.address}</span>
                        </div>
                    )}
                    {customer.taxNumber && (
                        <div>
                            <span className="text-slate-500 dark:text-slate-400">Vergi No:</span>
                            <span className="ml-2 text-slate-900 dark:text-slate-100">{customer.taxNumber}</span>
                        </div>
                    )}
                    {customer.taxOffice && (
                        <div>
                            <span className="text-slate-500 dark:text-slate-400">Vergi Dairesi:</span>
                            <span className="ml-2 text-slate-900 dark:text-slate-100">{customer.taxOffice}</span>
                        </div>
                    )}
                    {customer.creditLimit > 0 && (
                        <div>
                            <span className="text-slate-500 dark:text-slate-400">Kredi Limiti:</span>
                            <span className="ml-2 text-slate-900 dark:text-slate-100">
                                {customer.creditLimit.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 dark:border-slate-700">
                    <div className="flex gap-2 p-2">
                        <button
                            onClick={() => setActiveTab('transactions')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === 'transactions'
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            İşlemler ({transactions.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('invoices')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === 'invoices'
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            Faturalar ({invoices.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('offers')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === 'offers'
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            Teklifler ({offers.length})
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {activeTab === 'transactions' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">İşlem Geçmişi</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAddTransaction('payment')}
                                        className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-1"
                                    >
                                        <Add className="h-4 w-4" /> Tahsilat
                                    </button>
                                    <button
                                        onClick={() => handleAddTransaction('expense')}
                                        className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center gap-1"
                                    >
                                        <Add className="h-4 w-4" /> Ödeme
                                    </button>
                                </div>
                            </div>
                            
                            {transactions.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">Henüz işlem kaydı yok</div>
                            ) : (
                                <div className="space-y-3">
                                    {transactions.map(tx => (
                                        <div key={tx._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        tx.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {tx.type === 'income' ? 'Tahsilat' : 'Ödeme'}
                                                    </span>
                                                    <span className="text-sm text-slate-900 dark:text-slate-100 font-medium">{tx.description}</span>
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    {new Date(tx.date).toLocaleString('tr-TR')}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`text-lg font-bold ${
                                                    tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteTransaction(tx._id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Delete className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'invoices' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Faturalar</h3>
                                <button
                                    onClick={() => navigate('/panel/invoices')}
                                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center gap-1"
                                >
                                    <Add className="h-4 w-4" /> Yeni Fatura
                                </button>
                            </div>
                            
                            {invoices.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">Henüz fatura kaydı yok</div>
                            ) : (
                                <div className="space-y-3">
                                    {invoices.map(inv => (
                                        <div key={inv._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-900 dark:text-slate-100">{inv.invoiceNumber}</span>
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        inv.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                                        inv.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {inv.paymentStatus === 'paid' ? 'Ödendi' :
                                                         inv.paymentStatus === 'partial' ? 'Kısmi' : 'Ödenmedi'}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    {new Date(inv.date).toLocaleDateString('tr-TR')}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                                    {inv.total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                                </span>
                                                <button
                                                    onClick={() => navigate(`/panel/invoices/${inv._id}`)}
                                                    className="text-indigo-600 hover:text-indigo-700"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteInvoice(inv._id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Delete className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'offers' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Teklifler</h3>
                                <button
                                    onClick={() => navigate('/panel/offers')}
                                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center gap-1"
                                >
                                    <Add className="h-4 w-4" /> Yeni Teklif
                                </button>
                            </div>
                            
                            {offers.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">Henüz teklif kaydı yok</div>
                            ) : (
                                <div className="space-y-3">
                                    {offers.map(offer => (
                                        <div key={offer._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-900 dark:text-slate-100">{offer.offerNumber}</span>
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                        offer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {offer.status === 'accepted' ? 'Kabul' :
                                                         offer.status === 'rejected' ? 'Red' : 'Beklemede'}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    {new Date(offer.date).toLocaleDateString('tr-TR')}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                                    {offer.total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                                </span>
                                                <button
                                                    onClick={() => navigate(`/panel/offers/${offer._id}`)}
                                                    className="text-indigo-600 hover:text-indigo-700"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteOffer(offer._id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Delete className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Transaction Modal */}
            {showAddModal && (
                <AddTransactionModal
                    customerId={id}
                    type={modalType}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        fetchCustomerDetails();
                    }}
                />
            )}
        </div>
    );
};

// Add Transaction Modal Component
const AddTransactionModal = ({ customerId, type, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        accountId: ''
    });
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const res = await api.get('/accounts');
            setAccounts(res.data || []);
        } catch (err) {
            console.error('Error fetching accounts:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/transactions', {
                type: type === 'payment' ? 'income' : 'expense',
                amount: parseFloat(formData.amount),
                description: formData.description || (type === 'payment' ? 'Tahsilat' : 'Ödeme'),
                date: formData.date,
                customer: customerId,
                sourceAccount: formData.accountId
            });

            alert('İşlem başarıyla eklendi');
            onSuccess();
        } catch (err) {
            console.error('Error adding transaction:', err);
            alert(err.response?.data?.error || 'İşlem eklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {type === 'payment' ? 'Tahsilat Ekle' : 'Ödeme Ekle'}
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Tutar *
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Hesap *
                        </label>
                        <select
                            required
                            value={formData.accountId}
                            onChange={e => setFormData({ ...formData, accountId: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                        >
                            <option value="">Hesap Seçin</option>
                            {accounts.map(acc => (
                                <option key={acc._id} value={acc._id}>
                                    {acc.name} ({acc.type})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Açıklama
                        </label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Tarih *
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerDetailPage;
