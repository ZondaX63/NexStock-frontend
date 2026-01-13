import React, { useState } from 'react';
import {
    Add,
    Search,
    Edit,
    Delete,
    FilterList,
    Phone,
    Email,
    LocationOn
} from '@mui/icons-material';
import api from '../api';
import CustomerFormModal from '../components/CustomerFormModal';
import CariSummaryWidget from '../components/accounts/CariSummaryWidget';
import { useGlobalBalances } from '../hooks/useGlobalBalances';

const CustomersPage = () => {
    const {
        customers,
        suppliers,
        totalReceivables,
        totalPayables,
        loading,
        refreshBalances
    } = useGlobalBalances();

    // const [customers, setCustomers] = useState([]); // Removed local state
    // const [loading, setLoading] = useState(true); // Removed local state
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Removed local fetch logic as it's handled by the hook
    /*
    const fetchCustomers = async () => { ... }
    useEffect(() => { fetchCustomers(); }, []);
    */

    const handleSave = async (formData) => {
        try {
            if (selectedCustomer) {
                await api.put(`/customers/${selectedCustomer._id}`, formData);
            } else {
                await api.post('/customers', formData);
            }
            setIsModalOpen(false);
            setIsModalOpen(false);
            refreshBalances();
        } catch (error) {
            console.error('Error saving customer:', error);
            alert('Cari kaydedilirken bir hata oluştu.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu cari hesabı silmek istediğinize emin misiniz?')) {
            try {
                await api.delete(`/customers/${id}`);
                await api.delete(`/customers/${id}`);
                refreshBalances();
            } catch (error) {
                console.error('Error deleting customer:', error);
            }
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Cari Hesaplar</h2>
                    <p className="text-slate-500 mt-1">Müşteri ve tedarikçi hesaplarını buradan yönetebilirsiniz.</p>
                </div>
                <button
                    onClick={() => { setSelectedCustomer(null); setIsModalOpen(true); }}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-indigo-500/30"
                >
                    <Add className="mr-2 h-5 w-5" />
                    Yeni Cari Ekle
                </button>
            </div>

            {/* Global Summary Widget */}
            <CariSummaryWidget
                customers={customers}
                suppliers={suppliers}
                totalReceivables={totalReceivables}
                totalPayables={totalPayables}
            />

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-shadow"
                            placeholder="İsim, e-posta veya telefon ile ara..."
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
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cari Bilgileri</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">İletişim</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bakiye Durumu</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">İşlemler</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-slate-500">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                            <span className="ml-2">Yükleniyor...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-slate-500">
                                        Kayıt bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-slate-900">{customer.name}</div>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${customer.type === 'supplier' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                                        {customer.type === 'supplier' ? 'Tedarikçi' : 'Müşteri'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col space-y-1">
                                                {customer.phone && (
                                                    <div className="flex items-center text-sm text-slate-500">
                                                        <Phone className="h-4 w-4 mr-2" />
                                                        {customer.phone}
                                                    </div>
                                                )}
                                                {customer.email && (
                                                    <div className="flex items-center text-sm text-slate-500">
                                                        <Email className="h-4 w-4 mr-2" />
                                                        {customer.email}
                                                    </div>
                                                )}
                                                {customer.address && (
                                                    <div className="flex items-center text-sm text-slate-500">
                                                        <LocationOn className="h-4 w-4 mr-2" />
                                                        <span className="truncate max-w-xs">{customer.address}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <div className="text-sm">
                                                    <span className="text-slate-600">Toplam Satış: </span>
                                                    <span className="font-semibold text-slate-900">
                                                        ₺{(customer.totalAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                                <div className="text-sm">
                                                    <span className="text-slate-600">Tahsil Edilen: </span>
                                                    <span className="font-semibold text-emerald-600">
                                                        ₺{(customer.paidAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                                {(() => {
                                                    const balance = customer.balance || 0;
                                                    return (
                                                        <div className="text-xs mt-1">
                                                            {balance > 0 ? (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-emerald-700 bg-emerald-50 font-medium">
                                                                    ₺{balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ALACAK (Müşteri Borçlu)
                                                                </span>
                                                            ) : balance < 0 ? (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-red-700 bg-red-50 font-medium">
                                                                    ₺{Math.abs(balance).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} VERECEK (Biz Borçluyuz)
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-slate-600 bg-slate-50 font-medium">
                                                                    Hesap Kapalı
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => { setSelectedCustomer(customer); setIsModalOpen(true); }}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(customer._id)}
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

            <CustomerFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                customer={selectedCustomer}
            />
        </div>
    );
};

export default CustomersPage;
