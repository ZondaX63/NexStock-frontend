import React, { useState, useEffect } from 'react';
import { Close, AutoAwesome as SparklesIcon } from '@mui/icons-material';
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
        priceUSD: '',
        priceEUR: ''
    });
    const [aiLoading, setAiLoading] = useState(false);

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
                priceUSD: product.priceUSD || '',
                priceEUR: product.priceEUR || ''
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
                priceUSD: '',
                priceEUR: ''
            });

            if (isOpen) {
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

                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg leading-6 font-bold text-slate-900">
                                {product ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
                            </h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
                                <Close />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                    <label className="block text-sm font-medium text-slate-700">Alış Fiyatı</label>
                                    <input
                                        type="number"
                                        name="purchasePrice"
                                        value={formData.purchasePrice}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Satış Fiyatı</label>
                                    <input
                                        type="number"
                                        name="salePrice"
                                        value={formData.salePrice}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Para Birimi</label>
                                    <select
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="TRY">TRY</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
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

                                <div className="flex items-center">
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
