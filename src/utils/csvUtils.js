import { unparse, parse } from 'papaparse';
import api from '../api';

/**
 * Export products to CSV
 */
export const exportProductsToCsv = async (params = {}) => {
    try {
        const res = await api.get('/products', { params: { ...params, limit: 0 } });
        const dataToExport = res.data.products;
        
        const csvData = unparse(dataToExport, {
            columns: ["name", "sku", "barcode", "quantity", "salePrice", "purchasePrice", "unit", "criticalStockLevel"],
            header: true,
        });
        
        const blob = new Blob([`\uFEFF${csvData}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'urunler.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return { success: true };
    } catch (error) {
        console.error('Export error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Export low stock products to CSV
 */
export const exportLowStockToCsv = async (sort = {}) => {
    try {
        const params = {
            limit: 0,
            sort: sort.field,
            order: sort.order,
            lowStock: 'true'
        };
        
        const res = await api.get('/products', { params });
        const dataToExport = res.data.products;
        
        const csvData = unparse(dataToExport, {
            columns: ["name", "sku", "barcode", "quantity", "salePrice", "purchasePrice", "unit", "criticalStockLevel"],
            header: true,
        });
        
        const blob = new Blob([`\uFEFF${csvData}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'kritik_stok_urunler.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return { success: true };
    } catch (error) {
        console.error('Export low stock error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Import stock count results from CSV
 */
export const importStockCountFromCsv = async (file) => {
    try {
        // CSV dosyasını parse et
        const text = await file.text();
        const parsedData = parse(text, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(),
            transform: (value) => value ? value.trim() : ''
        });

        if (!parsedData.data || parsedData.data.length === 0) {
            throw new Error('CSV dosyası geçersiz veya boş');
        }

        const stockUpdates = [];

        for (const row of parsedData.data) {
            const update = {};
            
            // CSV başlıklarını kontrol et ve map et
            Object.keys(row).forEach(key => {
                const value = row[key];
                switch (key) {
                    case 'Ürün ID':
                        if (value) update._id = value;
                        break;
                    case 'Ürün Adı':
                        if (value) update.name = value;
                        break;
                    case 'SKU':
                        if (value) update.sku = value;
                        break;
                    case 'Barkod':
                        if (value) update.barcode = value;
                        break;
                    case 'Kategori':
                        if (value) update.category = value;
                        break;
                    case 'Marka':
                        if (value) update.brand = value;
                        break;
                    case 'Birim':
                        if (value) update.unit = value;
                        break;
                    case 'Miktar':
                    case 'Sayılan Miktar':
                        update.countedQuantity = parseFloat(value) || 0;
                        break;
                    case 'Raf':
                    case 'Raf Konumu':
                        if (value) update.shelfLocation = value;
                        break;
                    case 'Alış Fiyatı':
                        if (value) update.purchasePrice = parseFloat(value) || 0;
                        break;
                    case 'Satış Fiyatı':
                        if (value) update.salePrice = parseFloat(value) || 0;
                        break;
                    case 'Kritik Stok Miktarı':
                    case 'Kritik Stok Seviyesi':
                        if (value !== undefined && value !== null && value !== '') {
                            const parsedValue = parseInt(value);
                            update.criticalStockLevel = isNaN(parsedValue) ? 0 : parsedValue;
                        } else {
                            update.criticalStockLevel = 0;
                        }
                        break;
                    case 'Açıklama':
                        if (value) update.description = value;
                        break;
                    case 'Etiketler':
                        if (value) update.tags = value.split(', ').filter(tag => tag.trim());
                        break;
                    case 'Stok Takibi':
                        update.trackStock = value === 'Evet' || value === 'true' || value === '1';
                        break;
                    case 'Notlar':
                        if (value) update.countNotes = value;
                        break;
                    case 'Sayım Tarihi':
                        if (value) update.countDate = value;
                        break;
                }
            });

            // SKU zorunlu, en az miktar bilgisi olmalı
            if (update.sku && update.countedQuantity !== undefined) {
                stockUpdates.push(update);
            }
        }

        if (stockUpdates.length === 0) {
            throw new Error('İşlenebilir veri bulunamadı. SKU ve miktar bilgisi gerekli.');
        }

        // Backend'e gönder
        const payload = {
            stockUpdates,
            countDate: new Date().toISOString(),
            totalItemsCounted: stockUpdates.length,
            totalQuantityCounted: stockUpdates.reduce((sum, item) => sum + (item.countedQuantity || 0), 0),
            countType: 'mobile_app_csv_import',
            deviceInfo: `web_import_${new Date().toISOString()}`
        };

        console.log('Import payload:', payload); // Debug için

        const response = await api.post('/products/import-stock-count', payload);
        
        return {
            success: true,
            data: response.data,
            summary: response.data.summary
        };

    } catch (error) {
        console.error('Import error:', error);
        return {
            success: false,
            error: error.response?.data?.msg || error.message
        };
    }
};
