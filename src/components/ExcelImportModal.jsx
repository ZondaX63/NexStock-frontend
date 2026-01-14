import React, { useState } from 'react';
import { Close, FileUpload, FileDownload } from '@mui/icons-material';
import api from '../api';

const ExcelImportModal = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setResult(null); // Clear previous result
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/products/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(res.data);
            if (res.data.processed > 0 && onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Import error:', error);
            setResult({ error: error.response?.data?.msg || 'Bir hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        // Create a simple CSV/Excel template structure for user
        const headers = ['Name', 'SKU', 'Description', 'Barcode', 'Unit', 'PurchasePrice', 'SalePrice', 'Quantity', 'CriticalStock'];
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "template_products.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-slate-900 opacity-75" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-slate-900">Excel ile Ürün İçe Aktar</h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
                                <Close />
                            </button>
                        </div>

                        {/* Result View */}
                        {result && !result.error && (
                            <div className="mb-4 p-4 bg-green-50 rounded-md">
                                <h4 className="font-bold text-green-800">İşlem Tamamlandı</h4>
                                <ul className="text-sm text-green-700 mt-2">
                                    <li>İşlenen: {result.processed}</li>
                                    <li>Oluşturulan: {result.created}</li>
                                    <li>Güncellenen: {result.updated}</li>
                                    <li>Hatalı: {result.errors.length}</li>
                                </ul>
                                {result.errors.length > 0 && (
                                    <div className="mt-2 max-h-32 overflow-y-auto">
                                        <p className="font-semibold text-red-600">Hatalar:</p>
                                        {result.errors.map((e, idx) => (
                                            <p key={idx} className="text-xs text-red-500">
                                                {e.row?.SKU || 'Unknown'}: {e.error}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Error View */}
                        {result && result.error && (
                            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                                {result.error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
                                <input
                                    type="file"
                                    id="excel-upload"
                                    className="hidden"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="excel-upload" className="cursor-pointer flex flex-col items-center">
                                    <FileUpload className="text-slate-400 text-4xl mb-2" />
                                    <span className="text-sm text-slate-600 font-medium">
                                        {file ? file.name : 'Excel Dosyası Seçin (.xlsx)'}
                                    </span>
                                </label>
                            </div>

                            <button
                                onClick={handleUpload}
                                disabled={!file || loading}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                                    ${!file || loading ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none`}
                            >
                                {loading ? 'Yükleniyor...' : 'Yükle ve Başlat'}
                            </button>

                            <div className="text-center pt-2">
                                <button onClick={downloadTemplate} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center justify-center mx-auto">
                                    <FileDownload fontSize="small" className="mr-1" />
                                    Örnek Şablonu İndir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExcelImportModal;
