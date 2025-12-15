import { useState, useEffect, useCallback } from 'react';
import api from '../api';

export const useInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        type: '',
        status: '',
        customer: '',
        supplier: '',
        dateFrom: null,
        dateTo: null
    });
    const [sort, setSort] = useState({ field: 'date', order: 'desc' });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalInvoices, setTotalInvoices] = useState(0);

    const fetchInvoices = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                search: searchTerm,
                type: filters.type,
                status: filters.status,
                customer: filters.customer,
                supplier: filters.supplier,
                dateFrom: filters.dateFrom?.toISOString(),
                dateTo: filters.dateTo?.toISOString(),
                sort: sort.field,
                order: sort.order,
            };

            // Boş parametreleri temizle
            Object.keys(params).forEach(key => {
                if (!params[key]) delete params[key];
            });

            const response = await api.get('/invoices', { params });
            setInvoices(response.data.invoices || []);
            setTotalPages(response.data.totalPages || 1);
            setTotalInvoices(response.data.totalInvoices || 0);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, filters, sort]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const createInvoice = async (invoiceData) => {
        try {
            const response = await api.post('/invoices', invoiceData);
            await fetchInvoices();
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Create invoice error:', error);
            return { 
                success: false, 
                error: error.response?.data?.msg || 'Fatura oluşturulamadı' 
            };
        }
    };

    const updateInvoice = async (id, invoiceData) => {
        try {
            const response = await api.put(`/invoices/${id}`, invoiceData);
            await fetchInvoices();
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Update invoice error:', error);
            return { 
                success: false, 
                error: error.response?.data?.msg || 'Fatura güncellenemedi' 
            };
        }
    };

    const deleteInvoice = async (id) => {
        try {
            await api.delete(`/invoices/${id}`);
            await fetchInvoices();
            return { success: true };
        } catch (error) {
            console.error('Delete invoice error:', error);
            return { 
                success: false, 
                error: error.response?.data?.msg || 'Fatura silinemedi' 
            };
        }
    };

    const updateInvoiceStatus = async (id, newStatus) => {
        try {
            const response = await api.patch(`/invoices/${id}/status`, { status: newStatus });
            await fetchInvoices();
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Update invoice status error:', error);
            return { 
                success: false, 
                error: error.response?.data?.msg || 'Fatura durumu güncellenemedi' 
            };
        }
    };

    const duplicateInvoice = async (invoice) => {
        try {
            const duplicatedData = {
                ...invoice,
                invoiceNumber: `${invoice.invoiceNumber}_KOPYA`,
                status: 'draft',
                date: new Date().toISOString()
            };
            
            // ID ve timestamps'leri kaldır
            delete duplicatedData._id;
            delete duplicatedData.createdAt;
            delete duplicatedData.updatedAt;

            const response = await api.post('/invoices', duplicatedData);
            await fetchInvoices();
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Duplicate invoice error:', error);
            return { 
                success: false, 
                error: error.response?.data?.msg || 'Fatura kopyalanamadı' 
            };
        }
    };

    const getInvoiceStats = () => {
        const stats = {
            total: totalInvoices,
            draft: invoices.filter(inv => inv.status === 'draft').length,
            approved: invoices.filter(inv => inv.status === 'approved').length,
            paid: invoices.filter(inv => inv.status === 'paid').length,
            canceled: invoices.filter(inv => inv.status === 'canceled').length,
            totalAmount: invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0),
            pendingAmount: invoices
                .filter(inv => inv.status === 'approved')
                .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
        };
        return stats;
    };

    return {
        // State
        invoices,
        loading,
        searchTerm,
        filters,
        sort,
        page,
        totalPages,
        totalInvoices,
        
        // Setters
        setSearchTerm,
        setFilters,
        setSort,
        setPage,
        
        // Actions
        fetchInvoices,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        updateInvoiceStatus,
        duplicateInvoice,
        
        // Computed
        getInvoiceStats
    };
};
