import React, { useState, useEffect, useCallback } from 'react';
import { People, FileDownload, Add, TrendingUp, TrendingDown } from '@mui/icons-material';
import api from '../api';
import { unparse } from 'papaparse';

const CariPage = () => {
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState(null);
    const [partners, setPartners] = useState([]);
    const [stats, setStats] = useState({ customers: 0, suppliers: 0 });
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', contactPerson: '', type: 'customer' });

    const fetchPartners = useCallback(async () => {
        setLoading(true);
        try {
            const [customerRes, supplierRes] = await Promise.all([
                api.get('/customers'),
                api.get('/suppliers')
            ]);

            const customers = (customerRes.data.customers || customerRes.data.docs || []).map(c => ({ ...c, type: 'customer' }));
            const suppliers = (supplierRes.data.suppliers || supplierRes.data.docs || []).map(s => ({ ...s, type: 'supplier' }));

            if (selectedType === 'customer') {
                setPartners(customers);
            } else if (selectedType === 'supplier') {
                setPartners(suppliers);
            } else {
                setPartners([...customers, ...suppliers]);
            }

            setStats({
                customers: customerRes.data.totalDocs || customers.length,
                suppliers: supplierRes.data.totalDocs || suppliers.length
            });
        } catch (err) {
            console.error('Error fetching partners:', err);
        }
        setLoading(false);
    }, [selectedType]);

    useEffect(() => {
        fetchPartners();
    }, [fetchPartners]);

    const handleStatCardClick = (type) => {
        setSelectedType(selectedType === type ? null : type);
    };

    const handleExport = async () => {
        try {
            const csv = unparse(partners, {
                fields: ['name', 'email', 'phone', 'address', 'contactPerson'],
                header: true
            });
            const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', 'cari-hesaplar.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Export error:', error);
        }
    };

    const handleOpen = (partner = null) => {
        setIsEdit(!!partner);
        setFormData(partner || { name: '', email: '', phone: '', address: '', contactPerson: '', type: 'customer' });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            const type = formData.type;
            if (isEdit) {
                await api.put(`/${type === 'customer' ? 'customers' : 'suppliers'}/${formData._id}`, formData);
            } else {
                await api.post(`/${type === 'customer' ? 'customers' : 'suppliers'}`, formData);
            }
            setIsModalOpen(false);
            fetchPartners();
        } catch (error) {
            console.error('Error saving:', error);
            alert('İşlem başarısız');
        }
    };

    const filteredPartners = partners.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                    <People className="mr-2" />
                    Cari Hesaplar
                </h2>
                <p className="text-slate-500 mt-1">Müşteri ve tedarikçi hesaplarını buradan yönetebilirsiniz.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                    onClick={() => handleStatCardClick('customer')}
                    className={`bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all ${selectedType === 'customer' ? 'border-indigo-500 shadow-lg' : 'border-slate-200 hover:border-indigo-300'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Müşteriler</p>
                            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.customers}</p>
                        </div>
                        <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-emerald-600" />
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => handleStatCardClick('supplier')}
                    className={`bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all ${selectedType === 'supplier' ? 'border-indigo-500 shadow-lg' : 'border-slate-200 hover:border-indigo-300'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Tedarikçiler</p>
                            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.suppliers}</p>
                        </div>
                        <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <TrendingDown className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari hesap ara..."
                        className="flex-1 w-full sm:w-auto border border-slate-300 rounded-lg shadow-sm py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={handleExport}
                            className="flex-1 sm:flex-none inline-flex items-center px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            <FileDownload className="mr-2 h-5 w-5" />
                            Dışa Aktar
                        </button>
                        <button
                            onClick={() => handleOpen()}
                            className="flex-1 sm:flex-none inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-indigo-500/30"
                        >
                            <Add className="mr-2 h-5 w-5" />
                            Yeni Ekle
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ad</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tip</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">E-posta</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Telefon</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                            <span className="ml-2 text-slate-500">Yükleniyor...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPartners.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                                        Cari hesap bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                filteredPartners.map((partner) => (
                                    <tr key={partner._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900">{partner.name}</div>
                                            {partner.contactPerson && (
                                                <div className="text-xs text-slate-500">{partner.contactPerson}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${partner.type === 'customer'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {partner.type === 'customer' ? 'Müşteri' : 'Tedarikçi'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {partner.email || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {partner.phone || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleOpen(partner)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Düzenle
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setIsModalOpen(false)}>
                            <div className="absolute inset-0 bg-slate-900 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-bold text-slate-900 mb-4">
                                    {isEdit ? 'Cari Hesap Düzenle' : 'Yeni Cari Hesap Ekle'}
                                </h3>
                                <div className="space-y-4">
                                    {!isEdit && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Tip</label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            >
                                                <option value="customer">Müşteri</option>
                                                <option value="supplier">Tedarikçi</option>
                                            </select>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Ad</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">E-posta</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Telefon</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Yetkili Kişi</label>
                                        <input
                                            type="text"
                                            value={formData.contactPerson || ''}
                                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                            className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Adres</label>
                                        <textarea
                                            rows={3}
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    onClick={handleSave}
                                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Kaydet
                                </button>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    İptal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CariPage;
