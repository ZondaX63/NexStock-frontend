import React, { useState, useEffect } from 'react';
import {
    Add,
    Search,
    Edit,
    Delete,
    FilterList,
    AutoAwesome as SparklesIcon
} from '@mui/icons-material';
import api from '../api';
import ProductFormModal from '../components/ProductFormModal';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [predictionModel, setPredictionModel] = useState({ open: false, text: '', loading: false });

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await api.get('/products');
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
            console.error('Error saving product:', error);
            alert('Ürün kaydedilirken bir hata oluştu.');
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

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Ürün Yönetimi</h2>
                    <p className="text-slate-500 mt-1">Stoktaki tüm ürünlerinizi buradan yönetebilirsiniz.</p>
                </div>
                <button
                    onClick={() => { setSelectedProduct(null); setIsModalOpen(true); }}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-indigo-500/30"
                >
                    <Add className="mr-2 h-5 w-5" />
                    Yeni Ürün Ekle
                </button>
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
                    <button className="inline-flex items-center px-3 py-2 border border-slate-200 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <FilterList className="mr-2 h-4 w-4 text-slate-500" />
                        Filtrele
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ürün Adı</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SKU / Barkod</th>
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
                                            <div className="text-sm text-slate-900">{product.sku}</div>
                                            <div className="text-xs text-slate-500">{product.barcode}</div>
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
                                            {product.salePrice?.toLocaleString('tr-TR', { style: 'currency', currency: product.currency || 'TRY' })}
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
