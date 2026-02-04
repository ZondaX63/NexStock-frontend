import React, { useState, useEffect } from 'react';
import {
    Add,
    Search,
    Edit,
    Delete,
    FilterList,
    AutoAwesome as SparklesIcon,
    FileDownload,
    FileUpload
} from '@mui/icons-material';
import api from '../api';
import ProductFormModal from '../components/ProductFormModal';
import ExcelImportModal from '../components/ExcelImportModal';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [semanticLoading, setSemanticLoading] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [filterOpen, setFilterOpen] = useState(false);
    const [filters, setFilters] = useState({ category: '', brand: '', minStock: '', maxStock: '', inStockOnly: false });
    const [predictionModel, setPredictionModel] = useState({ open: false, text: '', loading: false });

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await api.get('/products?limit=0');
            setProducts(res.data.products || res.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMetadata = async () => {
        try {
            const [catRes, brandRes] = await Promise.all([
                api.get('/categories'),
                api.get('/brands')
            ]);
            setCategories(catRes.data || []);
            setBrands(brandRes.data || []);
        } catch (error) {
            console.error('Error fetching metadata:', error);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchMetadata();
    }, []);

    const handleSave = async (formData) => {
        try {
            if (selectedProduct) {
                await api.put(`/products/${selectedProduct._id}`, formData);
            } else {
                await api.post('/products', formData);
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (error) {
            const errMsg = error.response?.data?.message || error.response?.data?.msg || error.message || 'Ürün kaydedilirken bir hata oluştu.';
            console.error('Error saving product:', errMsg, error);
            // Show server-provided message when available to help debugging
            alert(errMsg);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const handlePredictStock = async (id) => {
        setPredictionModel({ open: true, text: '', loading: true });
        try {
            const res = await api.get(`/ai/predict-stock/${id}`);
            setPredictionModel({ open: true, text: res.data.forecast, loading: false });
        } catch (error) {
            console.error('Error predicting stock:', error);
            setPredictionModel({ open: true, text: 'Tahmin yapılırken bir hata oluştu.', loading: false });
        }
    };

    const handleSemanticSearch = async () => {
        if (!searchTerm.trim()) return;
        setSemanticLoading(true);
        try {
            const res = await api.post('/ai/semantic-search', { query: searchTerm });
            setAiSuggestions(res.data.suggestions || []);
        } catch (error) {
            console.error('Semantic Search Error:', error);
        } finally {
            setSemanticLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await api.get('/products/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'products.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export error:', error);
            alert('Dışa aktarma başarısız oldu.');
        }
    };

    const filteredProducts = products.filter(product => {
        const q = searchTerm.trim().toLowerCase();
        const matchesSearch = !q || (
            product.name.toLowerCase().includes(q) ||
            product.sku?.toLowerCase().includes(q) ||
            product.barcode?.toLowerCase().includes(q) ||
            (Array.isArray(product.oem) ? product.oem.some(o => o.toLowerCase().includes(q)) : (product.oem?.toLowerCase?.() || '').includes(q)) ||
            product.brand?.name?.toLowerCase().includes(q)
        );

        if (!matchesSearch) return false;

        if (filters.category && product.category?.name !== filters.category) return false;
        if (filters.brand && product.brand?.name !== filters.brand) return false;

        const qty = Number(product.quantity || 0);
        if (filters.inStockOnly && qty <= 0) return false;
        if (filters.minStock && qty < Number(filters.minStock)) return false;
        if (filters.maxStock && qty > Number(filters.maxStock)) return false;

        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Ürün Yönetimi</h2>
                    <p className="text-slate-500 mt-1">Stoktaki tüm ürünlerinizi buradan yönetebilirsiniz.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                        <FileUpload className="mr-2 h-5 w-5 text-slate-500" />
                        İçe Aktar
                    </button>
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                        <FileDownload className="mr-2 h-5 w-5 text-slate-500" />
                        Dışa Aktar
                    </button>
                    <button
                        onClick={() => window.open('/panel/print-labels', '_blank')}
                        className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                        <div className="mr-2 h-5 w-5 text-slate-500">🏷️</div>
                        Barkod Yazdır
                    </button>
                    <button
                        onClick={() => { setSelectedProduct(null); setIsModalOpen(true); }}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-indigo-500/30"
                    >
                        <Add className="mr-2 h-5 w-5" />
                        Yeni Ürün Ekle
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-shadow"
                            placeholder="Ürün adı, SKU veya barkod ile ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSemanticSearch}
                            disabled={semanticLoading || !searchTerm}
                            className={`inline-flex items-center px-4 py-2 border border-purple-100 shadow-sm text-sm font-medium rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none transition-all ${semanticLoading ? 'animate-pulse' : ''}`}
                            title="Yapay Zeka ile Benzerlerini Bul"
                        >
                            <SparklesIcon className={`mr-2 h-4 w-4 ${semanticLoading ? 'animate-spin' : ''}`} />
                            {semanticLoading ? 'Aranıyor...' : 'AI Akıllı Ara'}
                        </button>
                        <button onClick={() => setFilterOpen(prev => !prev)} className="inline-flex items-center px-3 py-2 border border-slate-200 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <FilterList className="mr-2 h-4 w-4 text-slate-500" />
                            Filtrele
                        </button>
                    </div>
                </div>

                {filterOpen && (
                    <div className="px-4 py-4 transition-all">
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Filtreler</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Listeyi daraltmak için bir veya birkaç filtre seçin</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => { setFilters({ category: '', brand: '', minStock: '', maxStock: '', inStockOnly: false }); }} className="text-xs px-3 py-1 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Temizle</button>
                                    <button onClick={() => setFilterOpen(false)} className="text-xs px-3 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Uygula</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 dark:text-slate-300 block mb-1">Kategori</label>
                                    <select value={filters.category} onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))} className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-2">
                                        <option value=''>Tümü</option>
                                        {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs text-slate-500 dark:text-slate-300 block mb-1">Marka</label>
                                    <select value={filters.brand} onChange={e => setFilters(prev => ({ ...prev, brand: e.target.value }))} className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-2">
                                        <option value=''>Tümü</option>
                                        {brands.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs text-slate-500 dark:text-slate-300 block mb-1">Min Stok</label>
                                    <input value={filters.minStock} onChange={e => setFilters(prev => ({ ...prev, minStock: e.target.value }))} type="number" className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-2" />
                                </div>

                                <div>
                                    <label className="text-xs text-slate-500 dark:text-slate-300 block mb-1">Max Stok</label>
                                    <input value={filters.maxStock} onChange={e => setFilters(prev => ({ ...prev, maxStock: e.target.value }))} type="number" className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-2" />
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <input type="checkbox" checked={filters.inStockOnly} onChange={e => setFilters(prev => ({ ...prev, inStockOnly: e.target.checked }))} className="h-4 w-4" />
                                    Sadece stokta olanlar
                                </label>

                                <div className="flex items-center gap-2">
                                    <button onClick={() => { setFilters({ category: '', brand: '', minStock: '', maxStock: '', inStockOnly: false }); setFilterOpen(false); }} className="px-3 py-2 text-sm rounded-md bg-slate-100 dark:bg-slate-800">Temizle</button>
                                    <button onClick={() => setFilterOpen(false)} className="px-3 py-2 text-sm rounded-md bg-indigo-600 text-white">Uygula</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {aiSuggestions.length > 0 && searchTerm && (
                    <div className="px-4 py-2 bg-purple-50 border-b border-purple-100 flex items-center gap-3 animate-in slide-in-from-top duration-300">
                        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">AI Önerileri:</span>
                        <div className="flex gap-2">
                            {aiSuggestions.map((s, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSearchTerm(s)}
                                    className="px-2 py-1 bg-white border border-purple-200 text-purple-700 text-xs rounded-md hover:bg-purple-100 transition-colors"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setAiSuggestions([])} className="ml-auto text-purple-400 hover:text-purple-600 text-xs font-bold">Temizle</button>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ürün Adı</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Marka</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stok Kodu</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Barkod</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">OEM No</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Raf No</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kategori</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stok</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fiyat</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">İşlemler</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                            <span className="ml-2">Yükleniyor...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                                        Ürün bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900">{product.name}</div>
                                            <div className="text-sm text-slate-500 truncate max-w-xs">{product.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-900">{product.brand?.name || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-900">{product.sku}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-900">{product.barcode || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-900 truncate max-w-[150px]" title={Array.isArray(product.oem) ? product.oem.join(', ') : (product.oem || '-')}>
                                                {Array.isArray(product.oem) ? product.oem.join(', ') : (product.oem || '-')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-900">{product.shelfLocation || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                {product.category?.name || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`text-sm font-medium ${product.quantity <= (product.criticalStockLevel || 0) ? 'text-red-600' : 'text-slate-900'}`}>
                                                {product.quantity} {product.unit}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            <div className="font-medium text-slate-900">
                                                {product.salePrice?.toLocaleString('tr-TR', {
                                                    style: 'currency',
                                                    currency: product.saleCurrency || product.currency || 'TRY'
                                                })}
                                            </div>
                                            {(product.saleCurrency || product.currency) !== 'TRY' && product.salePriceTRY && (
                                                <div className="text-[10px] text-emerald-600 font-bold mt-1">
                                                    ≈ {product.salePriceTRY.toLocaleString('tr-TR', {
                                                        style: 'currency',
                                                        currency: 'TRY'
                                                    })}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handlePredictStock(product._id)}
                                                className="text-purple-600 hover:text-purple-900 mr-4"
                                                title="AI Stok Tahmini"
                                            >
                                                <SparklesIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedProduct(product); setIsModalOpen(true); }}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Delete className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ProductFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                product={selectedProduct}
                categories={categories}
                brands={brands}
            />

            <ExcelImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={() => {
                    fetchProducts();
                    // Optional: keep modal open to show results or close it
                    // For now we keep it open so user sees stats, but refresh happens in background
                }}
            />

            {/* AI Prediction Modal */}
            {predictionModel.open && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm shadow-2xl">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-in zoom-in duration-200">
                        <div className="flex items-center gap-2 mb-4">
                            <SparklesIcon className="text-purple-600" />
                            <h3 className="text-lg font-bold text-slate-800">Akıllı Stok Tahmini</h3>
                        </div>
                        {predictionModel.loading ? (
                            <div className="flex flex-col items-center py-8">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                                <p className="mt-4 text-sm text-slate-500">Veriler analiz ediliyor...</p>
                            </div>
                        ) : (
                            <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100 mb-6">
                                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {predictionModel.text}
                                </p>
                            </div>
                        )}
                        <button
                            onClick={() => setPredictionModel({ ...predictionModel, open: false })}
                            className="w-full py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 transition-colors"
                        >
                            Kapat
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;
