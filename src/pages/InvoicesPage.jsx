import React, { useState, useEffect } from 'react';
import {
    Add,
    Search,
    Edit,
    Delete,
    FilterList,
    Description,
    Print,
    CheckCircle,
    Schedule,
    Error,
    Visibility,
    AutoAwesome as SparklesIcon
} from '@mui/icons-material';
import api from '../api';
import InvoiceFormModal from '../components/InvoiceFormModal';
import InvoiceDetailsModal from '../components/InvoiceDetailsModal';

const InvoicesPage = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [prefillData, setPrefillData] = useState(null);
    const [isScanning, setIsScanning] = useState(false);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const res = await api.get('/invoices');
            setInvoices(res.data.docs || res.data.invoices || res.data || []);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const handleSave = async (formData) => {
        try {
            if (selectedInvoice && isFormModalOpen) {
                await api.put(`/invoices/${selectedInvoice._id}`, formData);
            } else {
                await api.post('/invoices', formData);
            }
            setIsFormModalOpen(false);
            fetchInvoices();
        } catch (error) {
            console.error('Error saving invoice:', error);
            alert('Fatura kaydedilirken bir hata oluştu.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu faturayı silmek istediğinize emin misiniz?')) {
            try {
                await api.delete(`/invoices/${id}`);
                setIsDetailsModalOpen(false);
                fetchInvoices();
            } catch (error) {
                console.error('Error deleting invoice:', error);
            }
        }
    };

    const handleApprove = async (id) => {
        if (window.confirm('Faturayı onaylamak istediğinize emin misiniz? Bu işlem geri alınamaz ve stok/cari bakiyelerini güncelleyecektir.')) {
            try {
                await api.post(`/invoices/${id}/approve`);
                setIsDetailsModalOpen(false);
                fetchInvoices();
            } catch (error) {
                console.error('Error approving invoice:', error);
                alert('Fatura onaylanırken bir hata oluştu.');
            }
        }
    };

    const handlePayment = async (id, accountId, amount, type) => {
        try {
            const endpoint = type === 'collect' ? 'collect' : 'pay';
            await api.post(`/invoices/${id}/${endpoint}`, { accountId, amount });
            setIsDetailsModalOpen(false);
            fetchInvoices();
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('Ödeme işlemi sırasında bir hata oluştu.');
        }
    };

    const openDetails = (invoice) => {
        setSelectedInvoice(invoice);
        setIsDetailsModalOpen(true);
    };

    const handleScanReceipt = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsScanning(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await api.post('/ai/analyze-receipt', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Prepare prefill data for InvoiceFormModal
            const data = res.data;
            setPrefillData({
                invoiceNumber: data.invoiceNumber || '',
                date: data.date || new Date().toISOString().split('T')[0],
                items: data.products?.map(p => ({
                    product: '', // Needs careful matching or manual selection later
                    productName: p.name, // Temporary for UI if needed
                    quantity: p.quantity || 1,
                    unitPrice: p.price || 0,
                    taxRate: 18,
                    total: p.price * p.quantity * 1.18
                })) || []
            });
            setSelectedInvoice(null);
            setIsFormModalOpen(true);
        } catch (error) {
            console.error('OCR Error:', error);
            alert('Fatura taranırken bir hata oluştu veya görsel okunamadı.');
        } finally {
            setIsScanning(false);
            e.target.value = ''; // Reset input
        }
    };

    const openEdit = (invoice) => {
        setSelectedInvoice(invoice);
        setIsDetailsModalOpen(false);
        setIsFormModalOpen(true);
    };

    const getStatusBadge = (status, dueDate) => {
        const isOverdue = new Date(dueDate) < new Date() && status !== 'paid';

        if (status === 'paid') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <CheckCircle className="w-3 h-3 mr-1" /> Ödendi
                </span>
            );
        } else if (isOverdue) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <Error className="w-3 h-3 mr-1" /> Gecikmiş
                </span>
            );
        } else if (status === 'approved') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    <CheckCircle className="w-3 h-3 mr-1" /> Onaylandı
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    <Schedule className="w-3 h-3 mr-1" /> Taslak
                </span>
            );
        }
    };

    const filteredInvoices = invoices.filter(invoice =>
        invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Faturalar</h2>
                    <p className="text-slate-500 mt-1">Tüm alış ve satış faturalarınızı buradan yönetebilirsiniz.</p>
                </div>
                <div className="flex gap-3">
                    <label className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer shadow-sm ${isScanning
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 active:scale-95'
                        }`}>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleScanReceipt}
                            disabled={isScanning}
                        />
                        {isScanning ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                        ) : (
                            <SparklesIcon className="mr-2 h-4 w-4" />
                        )}
                        {isScanning ? 'Taranıyor...' : 'AI ile Tara'}
                    </label>

                    <button
                        onClick={() => { setSelectedInvoice(null); setPrefillData(null); setIsFormModalOpen(true); }}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-indigo-500/30"
                    >
                        <Add className="mr-2 h-5 w-5" />
                        Yeni Fatura
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
                            placeholder="Fatura no veya cari adı ile ara..."
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
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fatura No</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cari</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tarih</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tutar</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Durum</th>
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
                            ) : filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                                        Fatura bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map((invoice) => (
                                    <tr key={invoice._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Description className="h-5 w-5 text-slate-400 mr-2" />
                                                <span className="text-sm font-medium text-slate-900">{invoice.invoiceNumber}</span>
                                            </div>
                                            <span className={`text-xs ml-7 ${invoice.type === 'sale' ? 'text-indigo-600' : 'text-purple-600'}`}>
                                                {invoice.type === 'sale' ? 'Satış' : 'Alış'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900">
                                                {invoice.customer?.name || invoice.supplier?.name || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-900">{new Date(invoice.date).toLocaleDateString('tr-TR')}</div>
                                            <div className="text-xs text-slate-500">Vade: {new Date(invoice.dueDate).toLocaleDateString('tr-TR')}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-slate-900">
                                                {invoice.totalAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {invoice.currency}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(invoice.status, invoice.dueDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => openDetails(invoice)}
                                                className="text-slate-400 hover:text-indigo-600 mr-3"
                                                title="Detaylar"
                                            >
                                                <Visibility className="h-5 w-5" />
                                            </button>
                                            <button className="text-slate-400 hover:text-slate-600 mr-3">
                                                <Print className="h-5 w-5" />
                                            </button>
                                            {invoice.status === 'draft' && (
                                                <>
                                                    <button
                                                        onClick={() => openEdit(invoice)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(invoice._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Delete className="h-5 w-5" />
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <InvoiceFormModal
                isOpen={isFormModalOpen}
                onClose={() => { setIsFormModalOpen(false); setPrefillData(null); }}
                onSave={handleSave}
                invoice={selectedInvoice}
                prefillData={prefillData}
            />

            <InvoiceDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                invoice={selectedInvoice}
                onApprove={handleApprove}
                onPayment={handlePayment}
                onEdit={openEdit}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default InvoicesPage;
