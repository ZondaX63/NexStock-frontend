import React, { useState, useEffect } from 'react';
import api from '../api';
import {CheckCircle, History, } from '@mui/icons-material';

const RetailSalePage = () => {
    const [products, setProducts] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [salesHistory, setSalesHistory] = useState([]);
    const [query, setQuery] = useState('');
    const [cart, setCart] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [notes, setNotes] = useState('');
    const [onCredit, setOnCredit] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [lastSale, setLastSale] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSale, setSelectedSale] = useState(null);
    const [showSaleDetail, setShowSaleDetail] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                console.log('Fetching POS data...');
                const [prodRes, accRes, custRes, salesRes] = await Promise.all([
                    api.get('/products', { params: { limit: 0 } }),
                    api.get('/accounts'),
                    api.get('/customers', { params: { limit: 0 } }),
                    api.get('/pos/sales', { params: { limit: 20 } })
                ]);
                
                console.log('Products:', prodRes.data);
                console.log('Accounts:', accRes.data);
                console.log('Customers:', custRes.data);
                console.log('Sales:', salesRes.data);
                
                setProducts(prodRes.data.products || prodRes.data || []);
                setAccounts(accRes.data || []);
                setCustomers(custRes.data.docs || custRes.data.customers || custRes.data || []);
                setSalesHistory(salesRes.data || []);
                
                // Auto-select first cash/bank account
                const defaultAcc = (accRes.data || []).find(a => a.type === 'cash' || a.type === 'bank');
                if (defaultAcc) {
                    console.log('Auto-selected account:', defaultAcc.name);
                    setSelectedAccount(defaultAcc._id);
                }
            } catch (err) {
                console.error('Fetch error:', err);
                console.error('Error response:', err.response?.data);
                setError(err.response?.data?.error || 'Veri yüklenirken hata oluştu');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const searchResults = products.filter(p => {
        if (!query) return false;
        const q = query.toLowerCase();
        return p.name.toLowerCase().includes(q) || 
               p.sku?.toLowerCase().includes(q) || 
               p.barcode?.toLowerCase().includes(q);
    });

    const addToCart = (product) => {
        if (product.trackStock && product.quantity <= 0) {
            alert(`Stokta yok: ${product.name}`);
            return;
        }
        setCart(prev => {
            const existing = prev.find(i => i.productId === product._id);
            if (existing) {
                const newQty = existing.quantity + 1;
                if (product.trackStock && newQty > product.quantity) {
                    alert(`Maksimum stok: ${product.quantity}`);
                    return prev;
                }
                return prev.map(i => i.productId === product._id ? { ...i, quantity: newQty } : i);
            }
            return [...prev, { 
                productId: product._id, 
                quantity: 1, 
                name: product.name, 
                sku: product.sku,
                price: product.salePrice || 0,
                availableStock: product.quantity,
                trackStock: product.trackStock
            }];
        });
    };

    const changeQty = (productId, delta) => {
        setCart(prev => prev.map(i => {
            if (i.productId === productId) {
                const newQty = Math.max(0, i.quantity + delta);
                if (i.trackStock && newQty > i.availableStock) {
                    alert(`Maksimum stok: ${i.availableStock}`);
                    return i;
                }
                return { ...i, quantity: newQty };
            }
            return i;
        }).filter(i => i.quantity > 0));
    };

    const total = cart.reduce((s, it) => s + (it.price * it.quantity), 0);

    const viewSaleDetail = async (saleId) => {
        try {
            const res = await api.get(`/pos/sales/${saleId}`);
            setSelectedSale(res.data);
            setShowSaleDetail(true);
        } catch (err) {
            console.error('Sale detail error:', err);
            alert('Satış detayı yüklenemedi');
        }
    };

    const cancelSale = async (saleId) => {
        if (!window.confirm('Bu satışı iptal etmek istediğinizden emin misiniz? Stoklar geri eklenecek ve hesap bakiyeleri düzeltilecek.')) {
            return;
        }
        
        try {
            await api.post(`/pos/sales/${saleId}/cancel`);
            alert('✓ Satış başarıyla iptal edildi');
            setShowSaleDetail(false);
            setSelectedSale(null);
            
            // Refresh sales history
            const salesRes = await api.get('/pos/sales', { params: { limit: 20 } });
            setSalesHistory(salesRes.data || []);
            
            // Refresh products
            const prodRes = await api.get('/products', { params: { limit: 0 } });
            setProducts(prodRes.data.products || prodRes.data || []);
        } catch (err) {
            console.error('Cancel sale error:', err);
            alert(err.response?.data?.error || 'Satış iptal edilirken hata oluştu');
        }
    };

    const checkout = async () => {
        if (cart.length === 0) {
            alert('Sepet boş');
            return;
        }
        if (!onCredit && !selectedAccount) {
            alert('Lütfen ödeme hesabı seçin veya veresiye satış yapın');
            return;
        }
        if (onCredit && !selectedCustomer) {
            alert('Veresiye satış için müşteri seçilmelidir');
            return;
        }
        
        try {
            const items = cart.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price }));
            const payload = { 
                items, 
                payment: { accountId: selectedAccount, method: paymentMethod, amount: total },
                customerId: selectedCustomer || undefined,
                notes: notes || undefined,
                onCredit
            };
            
            console.log('Checkout payload:', payload);
            const res = await api.post('/pos/sale', payload);
            console.log('Checkout response:', res.data);
            
            setLastSale(res.data);
            setCart([]);
            setNotes('');
            setSelectedCustomer('');
            
            // Refresh sales history
            const salesRes = await api.get('/pos/sales', { params: { limit: 20 } });
            setSalesHistory(salesRes.data || []);
            
            // Refresh products to update stock
            const prodRes = await api.get('/products', { params: { limit: 0 } });
            setProducts(prodRes.data.products || prodRes.data || []);
            
            const successMsg = res.data.onCredit 
                ? `✓ Veresiye satış başarıyla kaydedildi!\nToplam: ${res.data.total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}\nMüşteri: ${res.data.customer?.name || 'Bilinmeyen'}\nYeni Borç: ${res.data.customer?.newBalance?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) || '0'}`
                : `✓ Satış başarıyla kaydedildi!\nToplam: ${res.data.total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}\nHesap: ${res.data.account?.name || 'Bilinmeyen'}`;
            
            alert(successMsg);
        } catch (err) {
            console.error('Checkout error:', err);
            console.error('Error response:', err.response?.data);
            alert(err.response?.data?.error || 'Satış sırasında hata oluştu');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Perakende Satış</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Hızlı satış yapın • Stok otomatik güncellenir • İşlemler hesaba kaydedilir</p>
                </div>
                <button 
                    onClick={() => setShowHistory(!showHistory)} 
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-2"
                >
                    <History /> {showHistory ? 'Satış Yap' : 'Satış Geçmişi'}
                </button>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-slate-600 dark:text-slate-400">Yükleniyor...</div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                    <p className="text-red-800 dark:text-red-200">Hata: {error}</p>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-2">Konsolu kontrol edin (F12) ve detaylı hata mesajlarını inceleyin.</p>
                </div>
            )}

            {!loading && !error && showHistory ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Son Satışlar</h3>
                    <div className="space-y-3">
                        {salesHistory.length === 0 ? (
                            <div className="text-slate-500">Henüz satış kaydı yok</div>
                        ) : salesHistory.map(sale => (
                            <div key={sale._id} className="border border-slate-100 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="font-medium text-slate-900 dark:text-slate-100">{sale.description}</div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">
                                            {new Date(sale.date).toLocaleString('tr-TR')} • 
                                            {sale.customer?.name && ` ${sale.customer.name} • `}
                                            {sale.sourceAccount?.name || 'Veresiye'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-lg font-bold text-green-600">
                                            {sale.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                        </div>
                                        <button
                                            onClick={() => viewSaleDetail(sale._id)}
                                            className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                        >
                                            Detay
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : !loading && !error && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
                            <input 
                                value={query} 
                                onChange={e => setQuery(e.target.value)} 
                                placeholder="Ürün adı, SKU veya barkod ile ara..." 
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 py-2.5" 
                            />
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm max-h-[500px] overflow-y-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {(query ? searchResults : products).slice(0, 50).map(p => (
                                    <div key={p._id} className={`border rounded-lg p-3 flex items-center justify-between ${p.trackStock && p.quantity <= 0 ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10' : 'border-slate-100 dark:border-slate-700'}`}>
                                        <div className="flex-1">
                                            <div className="font-medium text-slate-900 dark:text-slate-100">{p.name}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                SKU: {p.sku} • Stok: {p.quantity || 0}
                                                {p.trackStock && p.quantity <= (p.criticalStockLevel || 0) && (
                                                    <span className="ml-2 text-red-600 dark:text-red-400 font-medium">⚠ Kritik</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                {p.salePrice?.toLocaleString('tr-TR', { style: 'currency', currency: p.saleCurrency || 'TRY' })}
                                            </div>
                                            <button 
                                                onClick={() => addToCart(p)} 
                                                disabled={p.trackStock && p.quantity <= 0}
                                                className={`px-3 py-1 rounded-md ${p.trackStock && p.quantity <= 0 ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                            >
                                                Ekle
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Ödeme Bilgileri</h3>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Ödeme Hesabı {!onCredit && '*'}</label>
                                    <select 
                                        value={selectedAccount} 
                                        onChange={e => setSelectedAccount(e.target.value)}
                                        disabled={onCredit}
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Hesap Seçin</option>
                                        {accounts.map(acc => (
                                            <option key={acc._id} value={acc._id}>
                                                {acc.name} ({acc.type}) - {acc.balance.toLocaleString('tr-TR', { style: 'currency', currency: acc.currency || 'TRY' })}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Müşteri {onCredit && '*'}</label>
                                    <select 
                                        value={selectedCustomer} 
                                        onChange={e => setSelectedCustomer(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2"
                                    >
                                        <option value="">Müşteri Yok</option>
                                        {customers.map(c => (
                                            <option key={c._id} value={c._id}>
                                                {c.name} {c.balance > 0 ? `(Borç: ${c.balance.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Ödeme Yöntemi</label>
                                    <select 
                                        value={paymentMethod} 
                                        onChange={e => setPaymentMethod(e.target.value)}
                                        disabled={onCredit}
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="cash">Nakit</option>
                                        <option value="card">Kredi/Banka Kartı</option>
                                        <option value="transfer">Havale/EFT</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                    <input 
                                        type="checkbox"
                                        id="onCredit"
                                        checked={onCredit}
                                        onChange={e => setOnCredit(e.target.checked)}
                                        className="w-4 h-4 text-amber-600 rounded"
                                    />
                                    <label htmlFor="onCredit" className="text-sm font-medium text-amber-900 dark:text-amber-200 cursor-pointer">
                                        Veresiye Satış (Müşteri hesabına borç yaz)
                                    </label>
                                </div>

                                <div>
                                    <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Not (Opsiyonel)</label>
                                    <input 
                                        value={notes} 
                                        onChange={e => setNotes(e.target.value)}
                                        placeholder="Satış notu..."
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Sepet</h3>
                            <div className="space-y-3 max-h-[200px] overflow-y-auto">
                                {cart.length === 0 ? (
                                    <div className="text-sm text-slate-500 dark:text-slate-400">Sepet boş</div>
                                ) : cart.map(it => (
                                    <div key={it.productId} className="flex items-center justify-between text-sm">
                                        <div className="flex-1">
                                            <div className="font-medium text-slate-800 dark:text-slate-200">{it.name}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                {it.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} × {it.quantity}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => changeQty(it.productId, -1)} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-md text-slate-700 dark:text-slate-200">-</button>
                                            <div className="px-2 font-medium">{it.quantity}</div>
                                            <button onClick={() => changeQty(it.productId, +1)} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-md text-slate-700 dark:text-slate-200">+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-sm text-slate-500 dark:text-slate-400">Toplam</div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                        {total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                    </div>
                                </div>
                                <button 
                                    onClick={checkout} 
                                    disabled={cart.length === 0 || !selectedAccount}
                                    className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <CheckCircle /> Satışı Tamamla
                                </button>
                            </div>
                        </div>

                        {lastSale && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                                    <CheckCircle className="h-5 w-5" />
                                    <span className="font-semibold">Son Satış Başarılı</span>
                                </div>
                                <div className="text-sm text-green-600 dark:text-green-400">
                                    <div>Tutar: {lastSale.total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</div>
                                    {lastSale.account && <div>Hesap: {lastSale.account.name}</div>}
                                    {lastSale.customer && <div>Müşteri: {lastSale.customer.name}</div>}
                                    <div>Ürün: {lastSale.items.length} adet</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Sale Detail Modal */}
            {showSaleDetail && selectedSale && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSaleDetail(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Satış Detayı</h2>
                            <button onClick={() => setShowSaleDetail(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Summary */}
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Tarih</div>
                                        <div className="font-medium text-slate-900 dark:text-slate-100">{new Date(selectedSale.date).toLocaleString('tr-TR')}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Toplam Tutar</div>
                                        <div className="font-bold text-xl text-green-600">{selectedSale.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</div>
                                    </div>
                                    {selectedSale.customer && (
                                        <div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">Müşteri</div>
                                            <div className="font-medium text-slate-900 dark:text-slate-100">{selectedSale.customer.name}</div>
                                            {selectedSale.customer.phone && <div className="text-sm text-slate-500">{selectedSale.customer.phone}</div>}
                                        </div>
                                    )}
                                    {selectedSale.sourceAccount && (
                                        <div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">Ödeme Hesabı</div>
                                            <div className="font-medium text-slate-900 dark:text-slate-100">{selectedSale.sourceAccount.name}</div>
                                            <div className="text-sm text-slate-500">{selectedSale.sourceAccount.type}</div>
                                        </div>
                                    )}
                                    {selectedSale.type === 'receivable' && (
                                        <div className="col-span-2">
                                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="font-medium">Veresiye Satış</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Ürünler</h3>
                                <div className="space-y-2">
                                    {(selectedSale.items || []).map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                            <div className="flex-1">
                                                <div className="font-medium text-slate-900 dark:text-slate-100">{item.name}</div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                                    {item.sku && `SKU: ${item.sku} • `}
                                                    {item.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} × {item.quantity}
                                                </div>
                                            </div>
                                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                                                {item.subtotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <button
                                    onClick={() => cancelSale(selectedSale._id)}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                                >
                                    Satışı İptal Et
                                </button>
                                <button
                                    onClick={() => setShowSaleDetail(false)}
                                    className="flex-1 px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 font-medium"
                                >
                                    Kapat
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RetailSalePage;
