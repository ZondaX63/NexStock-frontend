import React, { useState, useEffect } from 'react';
import { Close, AutoAwesome as SparklesIcon, Calculate } from '@mui/icons-material';
import api from '../api';

const ProductFormModal = ({ isOpen, onClose, onSave, product, categories = [], brands = [] }) => {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        barcode: '',
        description: '',
        quantity: '',
        purchasePrice: '',
        salePrice: '',
        criticalStockLevel: '',
        unit: 'Adet',
        category: '',
        brand: '',
        shelfLocation: '',
        trackStock: true,
        currency: 'TRY',
        purchaseCurrency: 'TRY',
        saleCurrency: 'TRY',
        priceUSD: '',
        priceEUR: '',
        oem: ''
    });
    const [aiLoading, setAiLoading] = useState(false);
    const [exchangeRates, setExchangeRates] = useState(null);
    const [profitMargin, setProfitMargin] = useState(30);
    const [activeSection, setActiveSection] = useState('general'); // general, pricing, stock

    const fetchRates = async () => {
        try {
            const res = await api.get('/currency');
            setExchangeRates(res.data);
        } catch (err) {
            console.error('Rates fetch error:', err);
        }
    };

    useEffect(() => {
        const fetchNextSku = async () => {
            try {
                const res = await api.get('/products/next-sku');
                setFormData(prev => ({ ...prev, sku: res.data.sku }));
            } catch (err) {
                console.error('Error fetching SKU:', err);
                setFormData(prev => ({ ...prev, sku: 'STK-' + Date.now() }));
            }
        };

        if (product) {
            setFormData({
                name: product.name || '',
                sku: product.sku || '',
                barcode: product.barcode || '',
                description: product.description || '',
                quantity: product.quantity || '',
                purchasePrice: product.purchasePrice || '',
                salePrice: product.salePrice || '',
                criticalStockLevel: product.criticalStockLevel || '',
                unit: product.unit || 'Adet',
                category: product.category?._id || product.category || '',
                brand: product.brand?._id || product.brand || '',
                shelfLocation: product.shelfLocation || '',
                trackStock: product.trackStock !== false,
                currency: product.currency || 'TRY',
                purchaseCurrency: product.purchaseCurrency || product.currency || 'TRY',
                saleCurrency: product.saleCurrency || 'TRY',
                priceUSD: product.priceUSD || '',
                priceEUR: product.priceEUR || '',
                oem: Array.isArray(product.oem) ? product.oem.join(', ') : (product.oem || '')
            });
        } else {
            setFormData({
                name: '',
                sku: '',
                barcode: '',
                description: '',
                quantity: '',
                purchasePrice: '',
                salePrice: '',
                criticalStockLevel: '',
                unit: 'Adet',
                category: '',
                brand: '',
                shelfLocation: '',
                trackStock: true,
                currency: 'TRY',
                purchaseCurrency: 'TRY',
                saleCurrency: 'TRY',
                priceUSD: '',
                priceEUR: '',
                oem: ''
            });
        }
        if (isOpen) {
            fetchRates();
            if (!product) {
                fetchNextSku();
            }
        }
    }, [product, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Manuel kar marjı hesaplama fonksiyonu
    const calculateSalePrice = () => {
        const purchasePrice = parseFloat(formData.purchasePrice);
        if (isNaN(purchasePrice) || purchasePrice <= 0) return;

        let basePriceInTRY = purchasePrice;

        // 1. Alış fiyatını önce TL'ye çevir
        if (formData.purchaseCurrency !== 'TRY' && exchangeRates && exchangeRates[formData.purchaseCurrency]) {
            basePriceInTRY = purchasePrice * parseFloat(exchangeRates[formData.purchaseCurrency].rate);
        }

        // 2. Kar marjını ekle (TL üzerinden)
        let salePriceInTRY = basePriceInTRY * (1 + profitMargin / 100);

        // 3. Hedef para birimine çevir
        let finalSalePrice = salePriceInTRY;
        if (formData.saleCurrency !== 'TRY' && exchangeRates && exchangeRates[formData.saleCurrency]) {
            finalSalePrice = salePriceInTRY / parseFloat(exchangeRates[formData.saleCurrency].rate);
        }

        setFormData(prev => ({
            ...prev,
            salePrice: finalSalePrice.toFixed(2)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleAiDescription = async () => {
        if (!formData.name) {
            alert('Lütfen önce ürün adını giriniz.');
            return;
        }

        setAiLoading(true);
        try {
            const categoryObj = categories.find(c => c._id === formData.category);
            const res = await api.post('/ai/generate-description', {
                name: formData.name,
                categoryName: categoryObj?.name
            });
            setFormData(prev => ({
                ...prev,
                description: res.data.description
            }));
        } catch (error) {
            console.error('AI Description Error:', error);
            alert('Açıklama oluşturulurken bir hata oluştu.');
        } finally {
            setAiLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-slate-900 opacity-75" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg leading-6 font-bold text-slate-900">
                                {product ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
                            </h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
                                <Close />
                            </button>
                        </div>

                        {/* Section Tabs */}
                        <div className="flex space-x-2 mb-6 border-b border-slate-200">
                            <button
                                type="button"
                                onClick={() => setActiveSection('general')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeSection === 'general'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Genel Bilgiler
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveSection('pricing')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeSection === 'pricing'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Fiyatlandırma
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveSection('stock')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeSection === 'stock'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Stok & Raf
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* GENEL BİLGİLER */}
                            {activeSection === 'general' && (
                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700">Ürün Adı</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">SKU (Stok Kodu)</label>
                                        <input
                                            type="text"
                                            name="sku"
                                            value={formData.sku}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Barkod</label>
                                        <input
                                            type="text"
                                            name="barcode"
                                            value={formData.barcode}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-sm font-medium text-slate-700">Açıklama</label>
                                            <button
                                                type="button"
                                                onClick={handleAiDescription}
                                                disabled={aiLoading}
                                                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors disabled:text-slate-400"
                                            >
                                                <SparklesIcon style={{ fontSize: 14 }} />
                                                {aiLoading ? 'Oluşturuluyor...' : 'AI ile Yaz'}
                                            </button>
                                        </div>
                                        <textarea
                                            name="description"
                                            rows={3}
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Ürün hakkında kısa bilgi..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Kategori</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        >
                                            <option value="">Seçiniz</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Marka</label>
                                        <select
                                            name="brand"
                                            value={formData.brand}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        >
                                            <option value="">Seçiniz</option>
                                            {brands.map(brand => (
                                                <option key={brand._id} value={brand._id}>{brand.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700">OEM No (Virgülle ayırın)</label>
                                        <input
                                            type="text"
                                            name="oem"
                                            value={formData.oem}
                                            onChange={handleChange}
                                            placeholder="Örn: 1234, 5678, 9012"
                                            className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* FİYATLANDIRMA */}
                            {activeSection === 'pricing' && (
                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                    {/* Pricing Mode Selector */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Fiyatlandırma Modu</label>
                                        <div className="flex space-x-4 p-1 bg-slate-100 rounded-lg">
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, purchaseCurrency: 'TRY', saleCurrency: 'TRY' }))}
                                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formData.purchaseCurrency === 'TRY' && formData.saleCurrency === 'TRY'
                                                    ? 'bg-white text-indigo-600 shadow-sm'
                                                    : 'text-slate-500 hover:text-slate-700'
                                                    }`}
                                            >
                                                TL Çalışma (Standart)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, purchaseCurrency: 'USD', saleCurrency: 'USD' }))}
                                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formData.purchaseCurrency !== 'TRY' || formData.saleCurrency !== 'TRY'
                                                    ? 'bg-white text-indigo-600 shadow-sm'
                                                    : 'text-slate-500 hover:text-slate-700'
                                                    }`}
                                            >
                                                Dövizli Çalışma
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">
                                            Kar Marjı (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={profitMargin}
                                            onChange={(e) => setProfitMargin(parseFloat(e.target.value) || 0)}
                                            min="0"
                                            max="1000"
                                            step="5"
                                            className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 opacity-0">Hesapla</label>
                                        <button
                                            type="button"
                                            onClick={calculateSalePrice}
                                            className="mt-1 w-full inline-flex justify-center items-center gap-2 px-4 py-2 border border-indigo-300 rounded-lg text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            <Calculate fontSize="small" />
                                            Satış Fiyatını Hesapla
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Alış Fiyatı</label>
                                        <div className="mt-1 flex rounded-md shadow-sm">
                                            <input
                                                type="number"
                                                name="purchasePrice"
                                                value={formData.purchasePrice}
                                                onChange={handleChange}
                                                className="flex-1 block w-full border border-slate-300 rounded-none rounded-l-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2 px-3"
                                            />
                                            {(formData.purchaseCurrency !== 'TRY' || formData.saleCurrency !== 'TRY') && (
                                                <select
                                                    name="purchaseCurrency"
                                                    value={formData.purchaseCurrency}
                                                    onChange={handleChange}
                                                    className="inline-flex items-center px-3 border border-l-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm rounded-r-lg"
                                                >
                                                    <option value="TRY">TRY</option>
                                                    <option value="USD">USD</option>
                                                    <option value="EUR">EUR</option>
                                                </select>
                                            )}
                                            {formData.purchaseCurrency === 'TRY' && formData.saleCurrency === 'TRY' && (
                                                <span className="inline-flex items-center px-3 border border-l-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm rounded-r-lg">
                                                    TRY
                                                </span>
                                            )}
                                        </div>
                                        {formData.purchaseCurrency !== 'TRY' && formData.purchasePrice && exchangeRates && exchangeRates[formData.purchaseCurrency] && (
                                            <p className="mt-1 text-xs text-emerald-600 font-medium">
                                                ≈ {(formData.purchasePrice * parseFloat(exchangeRates[formData.purchaseCurrency].rate)).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Satış Fiyatı</label>
                                        <div className="mt-1 flex rounded-md shadow-sm">
                                            <input
                                                type="number"
                                                name="salePrice"
                                                value={formData.salePrice}
                                                onChange={handleChange}
                                                className="flex-1 block w-full border border-slate-300 rounded-none rounded-l-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2 px-3"
                                            />
                                            {(formData.purchaseCurrency !== 'TRY' || formData.saleCurrency !== 'TRY') && (
                                                <select
                                                    name="saleCurrency"
                                                    value={formData.saleCurrency}
                                                    onChange={handleChange}
                                                    className="inline-flex items-center px-3 border border-l-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm rounded-r-lg"
                                                >
                                                    <option value="TRY">TRY</option>
                                                    <option value="USD">USD</option>
                                                    <option value="EUR">EUR</option>
                                                </select>
                                            )}
                                            {formData.purchaseCurrency === 'TRY' && formData.saleCurrency === 'TRY' && (
                                                <span className="inline-flex items-center px-3 border border-l-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm rounded-r-lg">
                                                    TRY
                                                </span>
                                            )}
                                        </div>
                                        {formData.saleCurrency !== 'TRY' && formData.salePrice && exchangeRates && exchangeRates[formData.saleCurrency] && (
                                            <p className="mt-1 text-xs text-emerald-600 font-medium">
                                                ≈ {(formData.salePrice * parseFloat(exchangeRates[formData.saleCurrency].rate)).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* STOK & RAF */}
                            {activeSection === 'stock' && (
                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Miktar</label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Birim</label>
                                        <select
                                            name="unit"
                                            value={formData.unit}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        >
                                            <option value="Adet">Adet</option>
                                            <option value="Kg">Kg</option>
                                            <option value="Lt">Lt</option>
                                            <option value="Mt">Mt</option>
                                            <option value="Koli">Koli</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Kritik Stok Seviyesi</label>
                                        <input
                                            type="number"
                                            name="criticalStockLevel"
                                            value={formData.criticalStockLevel}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Raf No</label>
                                        <input
                                            type="text"
                                            name="shelfLocation"
                                            value={formData.shelfLocation}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>

                                    <div className="flex items-center sm:col-span-2">
                                        <input
                                            id="trackStock"
                                            name="trackStock"
                                            type="checkbox"
                                            checked={formData.trackStock}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                                        />
                                        <label htmlFor="trackStock" className="ml-2 block text-sm text-slate-900">
                                            Stok Takibi Yap
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse -mx-6 -mb-4 mt-6">
                                <button
                                    type="submit"
                                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Kaydet
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

export default ProductFormModal;
