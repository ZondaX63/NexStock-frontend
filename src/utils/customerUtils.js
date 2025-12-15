import { unparse } from 'papaparse';

/**
 * Export customers to CSV
 */
export const exportCustomersToCsv = (customers) => {
    try {
        const csvData = customers.map(customer => ({
            'Müşteri Adı': customer.name || '',
            'Şirket Adı': customer.companyName || '',
            'Email': customer.email || '',
            'Telefon': customer.phone || '',
            'Adres': customer.address || '',
            'Vergi No': customer.taxNumber || '',
            'Vergi Dairesi': customer.taxOffice || '',
            'Bakiye': customer.balance?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) || '0,00',
            'Kayıt Tarihi': customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('tr-TR') : '',
            'Müşteri Tipi': customer.customerType || 'Bireysel',
            'Durum': customer.isActive ? 'Aktif' : 'Pasif'
        }));

        const csv = unparse(csvData, { header: true });
        const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `musteriler_${new Date().toLocaleDateString('tr-TR')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return { success: true };
    } catch (error) {
        console.error('Customer CSV export error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Format customer balance
 */
export const formatBalance = (balance) => {
    if (!balance) return '₺0,00';
    return `₺${balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;
};

/**
 * Get balance color based on amount
 */
export const getBalanceColor = (balance) => {
    if (balance > 0) return 'success'; // Alacak (yeşil)
    if (balance < 0) return 'error';   // Borç (kırmızı)
    return 'default';                  // Sıfır (gri)
};

/**
 * Format customer display name
 */
export const getCustomerDisplayName = (customer) => {
    return customer.companyName || customer.name || 'İsimsiz Müşteri';
};

/**
 * Validate customer form data
 */
export const validateCustomerForm = (formData) => {
    const errors = {};

    if (!formData.name?.trim()) {
        errors.name = 'Müşteri adı gereklidir';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Geçerli bir email adresi giriniz';
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
        errors.phone = 'Geçerli bir telefon numarası giriniz';
    }

    if (formData.taxNumber && !/^\d{10,11}$/.test(formData.taxNumber.replace(/\s/g, ''))) {
        errors.taxNumber = 'Vergi numarası 10-11 haneli olmalıdır';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
