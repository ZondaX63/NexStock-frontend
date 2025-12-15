import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowUpward, ArrowDownward, Home, ChevronRight, Inventory } from '@mui/icons-material';
import api from '../api';

const ProductMovementsPage = () => {
    const { productId } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMovements = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await api.get(`/movements/product/${productId}`);
                setData(res.data);
            } catch (err) {
                setError('Veriler yüklenemedi.');
            } finally {
                setLoading(false);
            }
        };
        fetchMovements();
    }, [productId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500 py-10">{error}</div>;
    }

    if (!data) return null;

    const { product, movements } = data;

    return (
        <div className="space-y-6">
            <nav className="flex items-center space-x-2 text-sm text-slate-500">
                <Link to="/panel" className="flex items-center hover:text-indigo-600">
                    <Home className="h-4 w-4 mr-1" />
                    Anasayfa
                </Link>
                <ChevronRight className="h-4 w-4" />
                <Link to="/panel/products" className="hover:text-indigo-600">
                    Ürünler
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-slate-900 font-medium">{product.name} Stok Hareketleri</span>
            </nav>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                            <Inventory className="mr-2" />
                            {product.name}
                        </h2>
                        <p className="text-lg text-slate-600 mt-1">
                            Mevcut Stok: <span className="font-semibold text-indigo-600">{product.quantity} {product.unit}</span>
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tarih</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tip</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Miktar</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Açıklama</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">İlişkili Belge</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {movements.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                                        Henüz stok hareketi bulunmuyor.
                                    </td>
                                </tr>
                            ) : (
                                movements.map((move) => (
                                    <tr key={move._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {new Date(move.date).toLocaleString('tr-TR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${move.type === 'in'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {move.type === 'in' ? <ArrowUpward className="h-3 w-3 mr-1" /> : <ArrowDownward className="h-3 w-3 mr-1" />}
                                                {move.type === 'in' ? 'Stok Girişi' : 'Stok Çıkışı'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                                            {move.type === 'in' ? '+' : '-'}{move.quantity}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {move.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {move.relatedDocument ? (
                                                <Link
                                                    to={`/panel/invoices/${move.relatedDocument._id}`}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    {move.relatedDocument.invoiceNumber || 'Faturayı Görüntüle'}
                                                </Link>
                                            ) : (
                                                <span className="text-slate-400">Yok</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductMovementsPage;
