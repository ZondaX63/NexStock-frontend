import React from 'react';
import { Close, AccountBalanceWallet, Person, Business, Group } from '@mui/icons-material';

const AccountForm = ({ open, onClose, onSave, form, onChange }) => {
    if (!open) return null;

    const errors = {};
    if (!form.name) errors.name = 'Hesap adı zorunlu';
    if (!form.type) errors.type = 'Hesap tipi zorunlu';
    if (form.type === 'cari') {
        if (!form.cariType) errors.cariType = 'Cari türü zorunlu';
        if (!form.email) errors.email = 'E-posta zorunlu';
    }

    const getIcon = () => {
        switch (form.type) {
            case 'cari': return <Group className="h-6 w-6" />;
            case 'personnel': return <Person className="h-6 w-6" />;
            case 'company': return <Business className="h-6 w-6" />;
            default: return <AccountBalanceWallet className="h-6 w-6" />;
        }
    };

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
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                    {getIcon()}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {form._id ? 'Hesabı Düzenle' : 'Yeni Hesap Ekle'}
                                </h3>
                            </div>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
                                <Close />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Hesap Adı *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={onChange}
                                    placeholder="Örn: Kasa, Garanti Bankası"
                                    className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Hesap Tipi *</label>
                                <select
                                    name="type"
                                    value={form.type}
                                    onChange={onChange}
                                    className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="cash">Kasa</option>
                                    <option value="bank">Banka</option>
                                    <option value="credit_card">Kredi Kartı</option>
                                    <option value="personnel">Personel</option>
                                    <option value="cari">Cari (Müşteri/Tedarikçi)</option>
                                </select>
                            </div>

                            {/* Banka Özel Alanları */}
                            {form.type === 'bank' && (
                                <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <h4 className="text-sm font-semibold text-slate-700">Banka Bilgileri</h4>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Banka Adı</label>
                                        <input
                                            type="text"
                                            name="bankName"
                                            value={form.bankName || ''}
                                            onChange={onChange}
                                            placeholder="Örn: Garanti BBVA"
                                            className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">IBAN</label>
                                        <input
                                            type="text"
                                            name="iban"
                                            value={form.iban || ''}
                                            onChange={onChange}
                                            placeholder="TR..."
                                            className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 sm:text-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Şube Kodu</label>
                                            <input
                                                type="text"
                                                name="branchCode"
                                                value={form.branchCode || ''}
                                                onChange={onChange}
                                                className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Hesap No</label>
                                            <input
                                                type="text"
                                                name="accountNumber"
                                                value={form.accountNumber || ''}
                                                onChange={onChange}
                                                className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Kredi Kartı Özel Alanları */}
                            {form.type === 'credit_card' && (
                                <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <h4 className="text-sm font-semibold text-slate-700">Kredi Kartı Detayları</h4>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Kredi Limiti</label>
                                        <input
                                            type="number"
                                            name="creditLimit"
                                            value={form.creditLimit || ''}
                                            onChange={onChange}
                                            className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 sm:text-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Hesap Kesim Günü</label>
                                            <input
                                                type="number"
                                                min="1" max="31"
                                                name="cutoffDay"
                                                value={form.cutoffDay || ''}
                                                onChange={onChange}
                                                placeholder="1-31"
                                                className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Son Ödeme Günü</label>
                                            <input
                                                type="number"
                                                min="1" max="31"
                                                name="paymentDay"
                                                value={form.paymentDay || ''}
                                                onChange={onChange}
                                                placeholder="1-31"
                                                className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Bakiye {form._id ? '(Düzenlenemez)' : '*'}</label>
                                    <input
                                        type="number"
                                        name="balance"
                                        value={form.balance}
                                        onChange={onChange}
                                        placeholder="0.00"
                                        disabled={!!form._id}
                                        className={`mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${form._id ? 'bg-slate-100 text-slate-500' : ''}`}
                                    />
                                    {form._id && <p className="mt-1 text-xs text-slate-500">Bakiye sadece işlem ekleyerek değiştirilebilir.</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Para Birimi *</label>
                                    <select
                                        name="currency"
                                        value={form.currency}
                                        onChange={onChange}
                                        className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="TRY">TRY</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                    </select>
                                </div>
                            </div>

                            {form.type === 'cari' && (
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                                    <h4 className="text-sm font-semibold text-slate-900">Cari Bilgileri</h4>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Cari Türü *</label>
                                        <select
                                            name="cariType"
                                            value={form.cariType || ''}
                                            onChange={onChange}
                                            className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        >
                                            <option value="">Seçiniz</option>
                                            <option value="customer">Müşteri</option>
                                            <option value="supplier">Tedarikçi</option>
                                        </select>
                                        {errors.cariType && <p className="mt-1 text-xs text-red-600">{errors.cariType}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">E-posta *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email || ''}
                                            onChange={onChange}
                                            placeholder="cari@ornek.com"
                                            className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Telefon</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={form.phone || ''}
                                            onChange={onChange}
                                            placeholder="05xx xxx xx xx"
                                            className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Adres</label>
                                        <textarea
                                            name="address"
                                            value={form.address || ''}
                                            onChange={onChange}
                                            rows={2}
                                            placeholder="Açık adres bilgisi"
                                            className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            onClick={onSave}
                            disabled={Object.keys(errors).length > 0}
                            className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            {form._id ? 'Kaydet' : 'Ekle'}
                        </button>
                        <button
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            İptal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountForm;
