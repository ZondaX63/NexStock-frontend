import React, { useState, useEffect } from 'react';
import { Close, Add, Delete } from '@mui/icons-material';
import api from '../api';

const InvoiceFormModal = ({ isOpen, onClose, onSave, invoice, prefillData, formType = 'invoice' }) => {
    const [customers, setCustomers] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);

    // Get dynamic labels based on form type
    const getLabels = () => {
        switch (formType) {
            case 'offer':
                return {
                    title: invoice ? 'Teklif Düzenle' : 'Yeni Teklif Oluştur',
                    number: 'Teklif No',
                    date: 'Teklif Tarihi'
                };
            case 'order':
                return {
                    title: invoice ? 'Sipariş Düzenle' : 'Yeni Sipariş Oluştur',
                    number: 'Sipariş No',
                    date: 'Sipariş Tarihi'
                };
            default:
                return {
                    title: invoice ? 'Fatura Düzenle' : 'Yeni Fatura Oluştur',
                    number: 'Fatura No',
                    date: 'Fatura Tarihi'
                };
        }
    };

    const labels = getLabels();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [custRes, suppRes, prodRes] = await Promise.all([
                    api.get('/customers'),
                    api.get('/suppliers'),
                    api.get('/products')
                ]);
                setCustomers(custRes.data.customers || custRes.data.docs || custRes.data || []);
                setSuppliers(suppRes.data.suppliers || suppRes.data.docs || suppRes.data || []);
                setProducts(prodRes.data.products || prodRes.data || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const [formData, setFormData] = useState({
        invoiceNumber: '',
        type: 'sale',
        customer: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        currency: 'TRY',
        items: [
            { product: '', quantity: 1, unitPrice: 0, taxRate: 18, total: 0 }
        ],
        subtotal: 0,
        taxTotal: 0,
        totalAmount: 0,
        status: 'pending'
    });

    useEffect(() => {
        if (invoice) {
            setFormData({
                invoiceNumber: invoice.invoiceNumber || invoice.offerNumber || invoice.orderNumber || '',
                type: invoice.type || 'sale',
                customer: invoice.customer?._id || invoice.supplier?._id || '',
                date: invoice.date ? new Date(invoice.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
                currency: invoice.currency || 'TRY',
                items: invoice.items?.map(item => ({
                    product: item.product?._id || item.product,
                    quantity: item.quantity || 1,
                    unitPrice: item.unitPrice || 0,
                    taxRate: item.taxRate || 18,
                    total: (item.quantity * item.unitPrice * (1 + (item.taxRate || 18) / 100))
                })) || [{ product: '', quantity: 1, unitPrice: 0, taxRate: 18, total: 0 }],
                subtotal: invoice.subtotal || 0,
                taxTotal: invoice.taxTotal || 0,
                totalAmount: invoice.totalAmount || 0,
                status: invoice.status || 'pending'
            });
        } else if (prefillData) {
            setFormData({
                invoiceNumber: prefillData.invoiceNumber || '',
                type: 'purchase', // Default to purchase for receipts
                customer: '',
                date: prefillData.date || new Date().toISOString().split('T')[0],
                dueDate: '',
                currency: 'TRY',
                items: prefillData.items?.length > 0
                    ? prefillData.items.map(item => ({
                        product: '', // User needs to select the product
                        quantity: item.quantity || 1,
                        unitPrice: item.unitPrice || 0,
                        taxRate: item.taxRate || 18,
                        total: item.total || 0,
                        placeholderName: item.productName // Keep for display
                    }))
                    : [{ product: '', quantity: 1, unitPrice: 0, taxRate: 18, total: 0 }],
                subtotal: prefillData.items?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) || 0,
                taxTotal: prefillData.items?.reduce((sum, item) => sum + (item.quantity * item.unitPrice * 0.18), 0) || 0,
                totalAmount: prefillData.items?.reduce((sum, item) => sum + (item.quantity * item.unitPrice * 1.18), 0) || 0,
                status: 'pending'
            });
        } else {
            const prefix = formType === 'offer' ? 'OFF' : formType === 'order' ? 'ORD' : 'INV';
            setFormData({
                invoiceNumber: `${prefix}-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
                type: 'sale',
                customer: '',
                date: new Date().toISOString().split('T')[0],
                dueDate: '',
                currency: 'TRY',
                items: [{ product: '', quantity: 1, unitPrice: 0, taxRate: 18, total: 0 }],
                subtotal: 0,
                taxTotal: 0,
                totalAmount: 0,
                status: 'pending'
            });
        }
    }, [invoice, prefillData, isOpen, formType]);

    useEffect(() => {
        const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const taxTotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.taxRate / 100)), 0);
        const totalAmount = subtotal + taxTotal;

        setFormData(prev => ({
            ...prev,
            subtotal,
            taxTotal,
            totalAmount
        }));
    }, [formData.items]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;

        if (field === 'product') {
            const product = products.find(p => p._id === value);
            if (product) {
                newItems[index].unitPrice = formData.type === 'sale' ? product.salePrice : product.purchasePrice;
            }
        }

        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { product: '', quantity: 1, unitPrice: 0, taxRate: 18, total: 0 }]
        }));
    };

    const removeItem = (index) => {
        if (formData.items.length > 1) {
            setFormData(prev => ({
                ...prev,
                items: prev.items.filter((_, i) => i !== index)
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let payload = {
            ...formData,
            items: formData.items.map(item => ({
                product: item.product,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
                taxRate: Number(item.taxRate)
            }))
        };

        if (formType === 'order') {
            // Map fields for orders
            payload = {
                orderNumber: formData.invoiceNumber,
                supplier: formData.customer,
                products: payload.items,
                totalAmount: formData.totalAmount,
                currency: formData.currency,
                exchangeRate: formData.exchangeRate || 1,
                date: formData.date,
                expectedDeliveryDate: formData.dueDate,
                description: formData.description || ''
            };
        } else if (formType === 'offer') {
            // Map fields for offers
            payload = {
                offerNumber: formData.invoiceNumber,
                customer: formData.customer,
                products: payload.items,
                totalAmount: formData.totalAmount,
                currency: formData.currency,
                exchangeRate: formData.exchangeRate || 1,
                date: formData.date,
                validUntil: formData.dueDate,
                description: formData.description || ''
            };
        } else {
            // For invoices
            payload.products = payload.items.map(item => ({
                product: item.product,
                quantity: item.quantity,
                price: item.unitPrice,
                vat: item.taxRate
            }));
            delete payload.items;
            if (formData.type === 'sale') {
                payload.customerOrSupplier = formData.customer;
                payload.partnerModel = 'Customer';
            } else {
                payload.customerOrSupplier = formData.customer;
                payload.partnerModel = 'Supplier';
            }
            delete payload.customer;
            delete payload.supplier;
        }

        onSave(payload);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-slate-900 opacity-75" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg leading-6 font-bold text-slate-900">
                                {labels.title}
                            </h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
                                <Close />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Fatura Tipi</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="sale">Satış Faturası</option>
                                        <option value="purchase">Alış Faturası</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700">{labels.number}</label>
                                    <input
                                        type="text"
                                        name="invoiceNumber"
                                        value={formData.invoiceNumber}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700">
                                        {formData.type === 'sale' ? 'Müşteri/Tedarikçi' : 'Tedarikçi/Müşteri'}
                                    </label>
                                    <select
                                        name="customer"
                                        value={formData.customer}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="">Seçiniz</option>
                                        <optgroup label="Müşteriler">
                                            {customers.map(c => (
                                                <option key={c._id} value={c._id}>{c.name} (Müşteri)</option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="Tedarikçiler">
                                            {suppliers.map(s => (
                                                <option key={s._id} value={s._id}>{s.name} (Tedarikçi)</option>
                                            ))}
                                        </optgroup>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700">{labels.date}</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Vade Tarihi</label>
                                    <input
                                        type="date"
                                        name="dueDate"
                                        value={formData.dueDate}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Para Birimi</label>
                                    <select
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="TRY">TRY</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h4 className="text-sm font-medium text-slate-900 mb-4">Ürünler / Hizmetler</h4>
                                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-1/3">Ürün</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-24">Miktar</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-32">Birim Fiyat</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-24">KDV %</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-32">Toplam</th>
                                                <th className="px-4 py-3 relative w-10"><span className="sr-only">Sil</span></th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-200">
                                            {formData.items.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2">
                                                        <select
                                                            value={item.product}
                                                            onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                                                            required
                                                            className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${!item.product && item.placeholderName ? 'border-amber-300 bg-amber-50' : 'border-slate-300'
                                                                }`}
                                                        >
                                                            <option value="">{item.placeholderName ? `Eşleştir: ${item.placeholderName}` : 'Seçiniz'}</option>
                                                            {products.map(p => (
                                                                <option key={p._id} value={p._id}>{p.name}</option>
                                                            ))}
                                                        </select>
                                                        {item.placeholderName && !item.product && (
                                                            <p className="mt-1 text-[10px] text-amber-600 font-medium">AI Taraması: "{item.placeholderName}"</p>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                                            className="block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.unitPrice}
                                                            onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                                                            className="block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={item.taxRate}
                                                            onChange={(e) => handleItemChange(index, 'taxRate', Number(e.target.value))}
                                                            className="block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-slate-900 font-medium">
                                                        {(item.quantity * item.unitPrice * (1 + item.taxRate / 100)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(index)}
                                                            className="text-red-400 hover:text-red-600"
                                                        >
                                                            <Delete className="h-5 w-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="mt-3 inline-flex items-center px-3 py-2 border border-slate-300 shadow-sm text-sm leading-4 font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <Add className="-ml-0.5 mr-2 h-4 w-4" />
                                    Ürün Ekle
                                </button>
                            </div>

                            <div className="flex justify-end mt-6">
                                <div className="w-64 space-y-3">
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Ara Toplam:</span>
                                        <span>{formData.subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {formData.currency}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>KDV Toplam:</span>
                                        <span>{formData.taxTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {formData.currency}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-slate-900 border-t border-slate-200 pt-3">
                                        <span>Genel Toplam:</span>
                                        <span>{formData.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {formData.currency}</span>
                                    </div>
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

export default InvoiceFormModal;
