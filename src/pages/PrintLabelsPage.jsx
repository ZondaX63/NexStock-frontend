import React, { useState, useEffect } from 'react';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api';
import { Search, Print, CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';

const PrintLabelsPage = () => {
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [labelType, setLabelType] = useState('barcode'); // 'barcode' or 'qr'

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get('/products');
                setProducts(res.data.products || res.data || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleSelect = (product) => {
        if (selectedProducts.find(p => p._id === product._id)) {
            setSelectedProducts(selectedProducts.filter(p => p._id !== product._id));
        } else {
            setSelectedProducts([...selectedProducts, product]);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex justify-between items-center print:hidden">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Barkod & Etiket Yazdır</h2>
                    <p className="text-slate-500">Ürünleriniz için barkod veya QR kod etiketleri oluşturun.</p>
                </div>
                <button
                    onClick={handlePrint}
                    disabled={selectedProducts.length === 0}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Print />
                    Yazdır ({selectedProducts.length})
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden print:hidden">
                {/* Selection Sidebar */}
                <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Ürün Ara..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setLabelType('barcode')}
                                className={`flex-1 py-1 text-sm font-medium rounded-md transition-colors ${labelType === 'barcode' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                Barkod (Code128)
                            </button>
                            <button
                                onClick={() => setLabelType('qr')}
                                className={`flex-1 py-1 text-sm font-medium rounded-md transition-colors ${labelType === 'qr' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                QR Kod
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {loading ? (
                            <p className="text-center py-4 text-slate-400">Yükleniyor...</p>
                        ) : filteredProducts.map(product => {
                            const isSelected = !!selectedProducts.find(p => p._id === product._id);
                            return (
                                <div
                                    key={product._id}
                                    onClick={() => toggleSelect(product)}
                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50 border border-transparent'}`}
                                >
                                    {isSelected ? <CheckBox className="text-indigo-600" /> : <CheckBoxOutlineBlank className="text-slate-300" />}
                                    <div className="overflow-hidden">
                                        <p className={`text-sm font-medium truncate ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{product.name}</p>
                                        <p className="text-xs text-slate-400">{product.sku}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Preview Area */}
                <div className="flex-1 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-8 overflow-y-auto flex flex-wrap content-start gap-4 justify-center">
                    {selectedProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <Print style={{ fontSize: 64, opacity: 0.2 }} />
                            <p className="mt-4 font-medium">Yazdırılacak ürünleri seçin</p>
                        </div>
                    ) : (
                        selectedProducts.map((product, idx) => (
                            <div key={`${product._id}-${idx}`} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 w-[200px] flex flex-col items-center text-center">
                                <p className="text-xs font-bold text-slate-900 truncate w-full mb-2">{product.name}</p>

                                {labelType === 'barcode' ? (
                                    <Barcode
                                        value={product.sku || product.barcode || 'UNKNOWN'}
                                        width={1.5}
                                        height={40}
                                        fontSize={12}
                                    />
                                ) : (
                                    <QRCodeSVG
                                        value={JSON.stringify({ id: product._id, sku: product.sku })}
                                        size={80}
                                    />
                                )}

                                <p className="text-xs text-slate-500 mt-2">{product.sku}</p>
                                <p className="text-sm font-bold text-slate-900 mt-1">
                                    {product.salePrice?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Print Layout (Only visible when printing) */}
            <div className="hidden print:flex print:flex-wrap print:gap-4 print:p-0 print:m-0 print:justify-start">
                {selectedProducts.map((product, idx) => (
                    <div key={`${product._id}-print-${idx}`} className="border border-black p-2 w-[5cm] h-[3cm] flex flex-col items-center justify-center text-center break-inside-avoid">
                        <p className="text-[10px] font-bold truncate w-full mb-1">{product.name.substring(0, 25)}</p>
                        {labelType === 'barcode' ? (
                            <Barcode
                                value={product.sku || product.barcode || 'UNKNOWN'}
                                width={1}
                                height={30}
                                fontSize={10}
                                displayValue={false}
                            />
                        ) : (
                            <QRCodeSVG
                                value={JSON.stringify({ id: product._id, sku: product.sku })}
                                size={60}
                            />
                        )}
                        <p className="text-[10px] mt-1">{product.sku}</p>
                        <p className="text-[12px] font-bold">
                            {product.salePrice?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        </p>
                    </div>
                ))}
            </div>

            <style>{`
                @media print {
                    @page { margin: 0.5cm; }
                    body * { visibility: hidden; }
                    .print\\:flex, .print\\:flex * { visibility: visible; }
                    .print\\:flex { position: absolute; left: 0; top: 0; width: 100%; }
                    .print\\:hidden { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default PrintLabelsPage;
