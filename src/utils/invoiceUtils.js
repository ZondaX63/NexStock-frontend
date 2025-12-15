import { unparse } from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from '../api';

/**
 * Export invoices to CSV
 */
export const exportInvoicesToCsv = async (filters = {}) => {
    try {
        const params = {
            ...filters,
            limit: 0 // Tüm verileri al
        };
        
        const response = await api.get('/invoices', { params });
        const invoices = response.data.invoices || [];
        
        const csvData = invoices.map(invoice => ({
            'Fatura No': invoice.invoiceNumber,
            'Tip': invoice.type === 'sale' ? 'Satış' : 'Alış',
            'Müşteri/Tedarikçi': invoice.customer?.companyName || invoice.supplier?.companyName || '',
            'Tarih': new Date(invoice.date).toLocaleDateString('tr-TR'),
            'Vade Tarihi': invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('tr-TR') : '',
            'Toplam Tutar': invoice.totalAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
            'KDV': invoice.taxAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
            'Durum': getStatusLabel(invoice.status),
            'Açıklama': invoice.description || '',
            'Oluşturulma Tarihi': new Date(invoice.createdAt).toLocaleDateString('tr-TR')
        }));
        
        const csv = unparse(csvData, { header: true });
        const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `faturalar_${new Date().toLocaleDateString('tr-TR')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return { success: true };
    } catch (error) {
        console.error('CSV Export error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Export invoices to PDF
 */
export const exportInvoicesToPdf = async (filters = {}) => {
    try {
        const params = {
            ...filters,
            limit: 0
        };
        
        const response = await api.get('/invoices', { params });
        const invoices = response.data.invoices || [];
        
        const doc = new jsPDF();
        
        // PDF başlığı
        doc.setFontSize(20);
        doc.text('Fatura Listesi', 14, 22);
        
        doc.setFontSize(12);
        doc.text(`Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 32);
        
        // Tablo verileri
        const tableData = invoices.map(invoice => [
            invoice.invoiceNumber,
            invoice.type === 'sale' ? 'Satış' : 'Alış',
            invoice.customer?.companyName || invoice.supplier?.companyName || '',
            new Date(invoice.date).toLocaleDateString('tr-TR'),
            `₺${invoice.totalAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
            getStatusLabel(invoice.status)
        ]);
        
        doc.autoTable({
            head: [['Fatura No', 'Tip', 'Müşteri/Tedarikçi', 'Tarih', 'Tutar', 'Durum']],
            body: tableData,
            startY: 40,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [79, 70, 229] }
        });
        
        doc.save(`faturalar_${new Date().toLocaleDateString('tr-TR')}.pdf`);
        
        return { success: true };
    } catch (error) {
        console.error('PDF Export error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Generate single invoice PDF
 */
export const generateInvoicePdf = (invoice) => {
    try {
        const doc = new jsPDF();
        
        // Başlık
        doc.setFontSize(20);
        doc.text('FATURA', 14, 22);
        
        // Fatura bilgileri
        doc.setFontSize(12);
        doc.text(`Fatura No: ${invoice.invoiceNumber}`, 14, 40);
        doc.text(`Tarih: ${new Date(invoice.date).toLocaleDateString('tr-TR')}`, 14, 50);
        doc.text(`Tip: ${invoice.type === 'sale' ? 'Satış Faturası' : 'Alış Faturası'}`, 14, 60);
        
        // Müşteri/Tedarikçi bilgileri
        const partner = invoice.customer || invoice.supplier;
        if (partner) {
            doc.text('Müşteri/Tedarikçi Bilgileri:', 14, 80);
            doc.text(`${partner.companyName || partner.name}`, 14, 90);
            if (partner.email) doc.text(`Email: ${partner.email}`, 14, 100);
            if (partner.phone) doc.text(`Telefon: ${partner.phone}`, 14, 110);
        }
        
        // Ürün detayları
        if (invoice.items && invoice.items.length > 0) {
            const tableData = invoice.items.map(item => [
                item.productName || item.description,
                item.quantity?.toString() || '1',
                `₺${item.unitPrice?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
                `₺${item.totalPrice?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
            ]);
            
            doc.autoTable({
                head: [['Ürün/Hizmet', 'Miktar', 'Birim Fiyat', 'Toplam']],
                body: tableData,
                startY: 130,
                styles: { fontSize: 10 }
            });
        }
        
        // Toplam tutarlar
        const finalY = doc.lastAutoTable.finalY || 200;
        doc.text(`Ara Toplam: ₺${invoice.subtotalAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, 120, finalY + 20);
        doc.text(`KDV: ₺${invoice.taxAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, 120, finalY + 30);
        doc.setFontSize(14);
        doc.text(`TOPLAM: ₺${invoice.totalAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, 120, finalY + 45);
        
        doc.save(`fatura_${invoice.invoiceNumber}.pdf`);
        
        return { success: true };
    } catch (error) {
        console.error('Invoice PDF generation error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Status label helper
 */
export const getStatusLabel = (status) => {
    const statusLabels = {
        draft: 'Taslak',
        approved: 'Onaylandı',
        paid: 'Ödendi',
        canceled: 'İptal Edildi'
    };
    return statusLabels[status] || status;
};

/**
 * Status color helper
 */
export const getStatusColor = (status) => {
    const statusColors = {
        draft: 'warning',
        approved: 'success',
        paid: 'info',
        canceled: 'error'
    };
    return statusColors[status] || 'default';
};

/**
 * Status transitions helper
 */
export const getStatusTransitions = () => ({
    draft: {
        next: 'approved',
        nextLabel: 'Onayla',
        nextIcon: 'CheckCircle',
        nextColor: 'success',
        canRevert: false
    },
    approved: {
        next: 'paid',
        nextLabel: 'Öde/Tahsil Et',
        nextIcon: 'Payment',
        nextColor: 'info',
        prev: 'draft',
        prevLabel: 'Taslağa Çevir',
        prevIcon: 'Undo',
        prevColor: 'warning',
        canRevert: true
    },
    paid: {
        prev: 'approved',
        prevLabel: 'Ödeme İptal Et',
        prevIcon: 'Undo',
        prevColor: 'warning',
        canRevert: true
    },
    canceled: {
        canRevert: false
    }
});
