import React, { useState, useEffect } from 'react';
import {
    Add,
    Search,
    Edit,
    Delete,
    FilterList,
    Description,
    CheckCircle,
    Schedule,
    Cancel,
    Receipt
} from '@mui/icons-material';
import api from '../api';
import InvoiceFormModal from '../components/InvoiceFormModal';


const OffersPage = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/offers');
            setOffers(res.data || []);
        } catch (error) {
            console.error('Error fetching offers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    const handleSave = async (formData) => {
        try {
            if (selectedOffer) {
                await api.put(`/offers/${selectedOffer._id}`, formData);
            } else {
                await api.post('/offers', formData);
            }
            setIsModalOpen(false);
            fetchOffers();
        } catch (error) {
            console.error('Error saving offer:', error);
            alert('Teklif kaydedilirken bir hata oluştu.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu teklifi silmek istediğinize emin misiniz?')) {
            try {
                await api.delete(`/offers/${id}`);
                fetchOffers();
            } catch (error) {
                console.error('Error deleting offer:', error);
            }
        }
    };

    const handleConvertToInvoice = async (id) => {
        if (window.confirm('Bu teklifi faturaya dönüştürmek istediğinize emin misiniz?')) {
            try {
                const res = await api.post(`/offers/${id}/convert-to-invoice`);
                alert('Fatura başarıyla oluşturuldu: ' + res.data.invoiceNumber);
                fetchOffers();
                // Optional: Navigate to invoices page or open the invoice
                // navigate('/invoices'); 
            } catch (error) {
                console.error('Error converting offer:', error);
                alert('Fatura oluşturulurken bir hata oluştu.');
            }
        }
    };

    const getStatusBadge = (status) => {
        if (status === 'accepted') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <CheckCircle className="w-3 h-3 mr-1" /> Kabul Edildi
                </span>
            );
        } else if (status === 'rejected') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <Cancel className="w-3 h-3 mr-1" /> Reddedildi
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    <Schedule className="w-3 h-3 mr-1" /> Bekliyor
                </span>
            );
        }
    };

    const filteredOffers = offers.filter(offer =>
        offer.offerNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Teklifler</h2>
                    <p className="text-slate-500 mt-1">Tüm tekliflerinizi buradan yönetebilirsiniz.</p>
                </div>
                <button
                    onClick={() => { setSelectedOffer(null); setIsModalOpen(true); }}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-indigo-500/30"
                >
                    <Add className="mr-2 h-5 w-5" />
                    Yeni Teklif
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
                            placeholder="Teklif no veya müşteri adı ile ara..."
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
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Teklif No</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Müşteri</th>
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
                            ) : filteredOffers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                                        Teklif bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                filteredOffers.map((offer) => (
                                    <tr key={offer._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Description className="h-5 w-5 text-slate-400 mr-2" />
                                                <span className="text-sm font-medium text-slate-900">{offer.offerNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900">
                                                {offer.customer?.name || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-900">{new Date(offer.date).toLocaleDateString('tr-TR')}</div>
                                            {offer.validUntil && (
                                                <div className="text-xs text-slate-500">Geçerlilik: {new Date(offer.validUntil).toLocaleDateString('tr-TR')}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-slate-900">
                                                {offer.totalAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {offer.currency}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(offer.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleConvertToInvoice(offer._id)}
                                                className="text-green-600 hover:text-green-900 mr-3"
                                                title="Faturaya Dönüştür"
                                            >
                                                <Receipt className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedOffer(offer); setIsModalOpen(true); }}
                                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(offer._id)}
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

            <InvoiceFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                invoice={selectedOffer}
                formType="offer"
            />
        </div>
    );
};

export default OffersPage;
