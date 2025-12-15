import { useState, useEffect, useCallback } from 'react';
import api from '../api';

export const useCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const params = searchTerm ? { search: searchTerm } : {};
            const response = await api.get('/customers', { params });
            setCustomers(response.data || []);
        } catch (error) {
            console.error('Error fetching customers:', error);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const createCustomer = async (customerData) => {
        try {
            const response = await api.post('/customers', customerData);
            await fetchCustomers();
            return { success: true, data: response.data };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.msg || 'Müşteri oluşturulamadı' 
            };
        }
    };

    const updateCustomer = async (id, customerData) => {
        try {
            const response = await api.put(`/customers/${id}`, customerData);
            await fetchCustomers();
            return { success: true, data: response.data };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.msg || 'Müşteri güncellenemedi' 
            };
        }
    };

    const deleteCustomer = async (id) => {
        try {
            await api.delete(`/customers/${id}`);
            await fetchCustomers();
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.msg || 'Müşteri silinemedi' 
            };
        }
    };

    const getCustomerDetails = async (id) => {
        try {
            const [invoicesRes, transactionsRes, debtRes] = await Promise.all([
                api.get(`/customers/${id}/invoices`),
                api.get(`/customers/${id}/transactions`),
                api.get(`/customers/${id}/debt`)
            ]);

            return {
                success: true,
                data: {
                    invoices: invoicesRes.data || [],
                    transactions: transactionsRes.data || [],
                    debtInfo: debtRes.data || { balance: 0, totalDebt: 0, totalPayment: 0 }
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.msg || 'Müşteri detayları alınamadı'
            };
        }
    };

    const adjustCustomerBalance = async (id, adjustmentData) => {
        try {
            const response = await api.post(`/customers/${id}/balance-adjustment`, adjustmentData);
            await fetchCustomers();
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.msg || 'Bakiye ayarlanamadı'
            };
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm)
    );

    return {
        customers: filteredCustomers,
        allCustomers: customers,
        loading,
        searchTerm,
        setSearchTerm,
        fetchCustomers,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomerDetails,
        adjustCustomerBalance
    };
};
