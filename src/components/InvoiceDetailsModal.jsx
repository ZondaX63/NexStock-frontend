import React, { useState } from 'react';
import {
    Close,
    Print,
    Edit,
    Delete,
    CheckCircle,
    Payment,
    Description,
    Person,
    CalendarToday,
    AttachMoney,
    Email as EmailIcon,
    AutoAwesome as SparklesIcon
} from '@mui/icons-material';
import api from '../api';
import PaymentModal from './PaymentModal';

const InvoiceDetailsModal = ({ isOpen, onClose, invoice, onApprove, onPayment, onEdit, onDelete }) => {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [emailModal, setEmailModal] = useState({ open: false, content: '', loading: false });

    if (!isOpen || !invoice) return null;

    const isSale = invoice.type === 'sale';
    const isDraft = invoice.status === 'draft';
    const isApproved = invoice.status === 'approved';
    const isPaid = invoice.status === 'paid';

    // Calculate remaining amount
    const paidAmount = invoice.paidAmount || 0;
    const remainingAmount = invoice.totalAmount - paidAmount;

    const handlePaymentConfirm = (accountId, amount) => {
        onPayment(invoice._id, accountId, amount, isSale ? 'collect' : 'pay');
        setIsPaymentModalOpen(false);
    };

    const handleGenerateEmail = async () => {
        setEmailModal({ open: true, content: '', loading: true });
        try {
            const res = await api.post('/ai/generate-email', {
                type: invoice.status === 'draft' ? 'offer' : 'invoice',
                partnerName: invoice.customer?.name || invoice.supplier?.name || 'Sayın Yetkili',
                items: invoice.items?.map(i => ({ name: i.product?.name || i.product })),
                totalAmount: invoice.totalAmount,
                currency: invoice.currency
            });
            setEmailModal({ open: true, content: res.data.emailContent, loading: false });
        } catch (error) {
            console.error('Email Gen Error:', error);
            setEmailModal({ open: true, content: 'E-posta oluşturulurken bir hata oluştu.', loading: false });
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-slate-900 opacity-75" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">

                    {/* Header */}
                    <div className="bg-slate-50 px-4 py-4 sm:px-6 border-b border-slate-200 flex justify-between items-center">
                        <div className="flex items-center">
                            <div className={`p-2 rounded-lg mr-3 ${isSale ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'}`}>
                                <Description />
                            </div>
                            <div>
                                <h3 className="text-lg leading-6 font-bold text-slate-900">
                                    {invoice.invoiceNumber}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    {isSale ? 'Satış Faturası' : 'Alış Faturası'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${isPaid ? 'bg-emerald-100 text-emerald-800' :
                                isApproved ? 'bg-amber-100 text-amber-800' :
                                    'bg-slate-100 text-slate-800'
                                }`}>
                                {isPaid ? 'Ödendi' : isApproved ? 'Onaylandı' : 'Taslak'}
                            </span>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-500 ml-4">
                                <Close />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-4 py-5 sm:p-6">
                        {/* Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                            <div className="bg-slate-50 p-4 rounded-xl">
                                <div className="flex items-center text-slate-500 mb-2">
                                    <Person className="w-4 h-4 mr-2" />
                                    <span className="text-xs font-medium uppercase">Cari Hesap</span>
                                </div>
                                <div className="font-semibold text-slate-900">
                                    {invoice.customer?.name || invoice.supplier?.name || '-'}
                                </div>
                                <div className="text-sm text-slate-500 mt-1">
                                    {invoice.customer?.email || invoice.supplier?.email}
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl">
                                <div className="flex items-center text-slate-500 mb-2">
                                    <CalendarToday className="w-4 h-4 mr-2" />
                                    <span className="text-xs font-medium uppercase">Tarihler</span>
                                </div>
                                <div className="text-sm text-slate-900 flex justify-between mb-1">
                                    <span>Fatura Tarihi:</span>
                                    <span className="font-medium">{new Date(invoice.date).toLocaleDateString('tr-TR')}</span>
                                </div>
                                <div className="text-sm text-slate-900 flex justify-between">
                                    <span>Vade Tarihi:</span>
                                    <span className="font-medium">{new Date(invoice.dueDate).toLocaleDateString('tr-TR')}</span>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl">
                                <div className="flex items-center text-slate-500 mb-2">
                                    <AttachMoney className="w-4 h-4 mr-2" />
                                    <span className="text-xs font-medium uppercase">Ödeme Durumu</span>
                                </div>
                                <div className="text-sm text-slate-900 flex justify-between mb-1">
                                    <span>Toplam:</span>
                                    <span className="font-bold">{invoice.totalAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {invoice.currency}</span>
                                </div>
                                <div className="text-sm text-slate-900 flex justify-between mb-1">
                                    <span>Ödenen:</span>
                                    <span className="text-emerald-600 font-medium">{paidAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {invoice.currency}</span>
                                </div>
                                <div className="text-sm text-slate-900 flex justify-between border-t border-slate-200 pt-1 mt-1">
                                    <span>Kalan:</span>
                                    <span className="text-red-600 font-bold">{remainingAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {invoice.currency}</span>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="border border-slate-200 rounded-lg overflow-hidden mb-8">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ürün / Hizmet</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Miktar</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Birim Fiyat</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">KDV</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Toplam</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {invoice.items?.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                {item.product?.name || item.product}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">
                                                {item.quantity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">
                                                {item.unitPrice?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">
                                                %{item.taxRate}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 text-right">
                                                {(item.quantity * item.unitPrice * (1 + item.taxRate / 100)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-50">
                                    <tr>
                                        <td colSpan="4" className="px-6 py-3 text-right text-sm font-medium text-slate-500">Ara Toplam</td>
                                        <td className="px-6 py-3 text-right text-sm font-bold text-slate-900">
                                            {invoice.subtotal?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {invoice.currency}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="4" className="px-6 py-3 text-right text-sm font-medium text-slate-500">KDV Toplam</td>
                                        <td className="px-6 py-3 text-right text-sm font-bold text-slate-900">
                                            {invoice.taxTotal?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {invoice.currency}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="4" className="px-6 py-3 text-right text-base font-bold text-slate-900">Genel Toplam</td>
                                        <td className="px-6 py-3 text-right text-base font-bold text-indigo-600">
                                            {invoice.totalAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {invoice.currency}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="bg-slate-50 px-4 py-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex space-x-3">
                            <button className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50">
                                <Print className="w-4 h-4 mr-2" />
                                Yazdır
                            </button>
                            <button
                                onClick={handleGenerateEmail}
                                className="inline-flex items-center px-4 py-2 border border-purple-200 shadow-sm text-sm font-medium rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100"
                            >
                                <SparklesIcon className="w-4 h-4 mr-2" />
                                AI Mail
                            </button>
                            {isDraft && (
                                <>
                                    <button
                                        onClick={() => onEdit(invoice)}
                                        className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50"
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Düzenle
                                    </button>
                                    <button
                                        onClick={() => onDelete(invoice._id)}
                                        className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50"
                                    >
                                        <Delete className="w-4 h-4 mr-2" />
                                        Sil
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="flex space-x-3">
                            {isDraft && (
                                <button
                                    onClick={() => onApprove(invoice._id)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Faturayı Onayla
                                </button>
                            )}

                            {isApproved && remainingAmount > 0 && (
                                <button
                                    onClick={() => setIsPaymentModalOpen(true)}
                                    className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white ${isSale ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                                        }`}
                                >
                                    <Payment className="w-4 h-4 mr-2" />
                                    {isSale ? 'Tahsilat Al' : 'Ödeme Yap'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onConfirm={handlePaymentConfirm}
                type={isSale ? 'collection' : 'payment'}
                invoice={invoice}
                maxAmount={remainingAmount}
            />

            {/* AI Email Modal */}
            {
                emailModal.open && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-in zoom-in duration-200">
                            <div className="flex items-center gap-2 mb-4">
                                <EmailIcon className="text-purple-600" />
                                <h3 className="text-lg font-bold text-slate-800">AI E-posta Taslağı</h3>
                            </div>

                            {emailModal.loading ? (
                                <div className="flex flex-col items-center py-8">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                                    <p className="mt-4 text-sm text-slate-500">Taslak yazılıyor...</p>
                                </div>
                            ) : (
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 max-h-96 overflow-y-auto">
                                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                                        {emailModal.content}
                                    </pre>
                                </div>
                            )}

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setEmailModal({ ...emailModal, open: false })}
                                    className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-sm transition-colors"
                                >
                                    Kapat
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(emailModal.content);
                                        alert('Kopyalandı!');
                                        setEmailModal({ ...emailModal, open: false });
                                    }}
                                    disabled={emailModal.loading}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold text-sm hover:bg-purple-700 transition-colors shadow-sm shadow-purple-500/30 disabled:opacity-50"
                                >
                                    Kopyala
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default InvoiceDetailsModal;
