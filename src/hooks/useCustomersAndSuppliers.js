import { useState, useEffect } from 'react';
import api from '../api';

export const useCustomersAndSuppliers = () => {
    const [customers, setCustomers] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [customersRes, suppliersRes] = await Promise.all([
                    api.get('/customers', { params: { limit: 0 } }),
                    api.get('/suppliers', { params: { limit: 0 } })
                ]);
                // Handle both paginated and non-paginated shapes
                const cs = customersRes.data;
                const ss = suppliersRes.data;
                const customersArr = Array.isArray(cs)
                    ? cs
                    : (cs?.customers || cs?.docs || []);
                const suppliersArr = Array.isArray(ss)
                    ? ss
                    : (ss?.suppliers || ss?.docs || []);
                setCustomers(customersArr);
                setSuppliers(suppliersArr);
            } catch (error) {
                console.error('Error fetching customers and suppliers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return {
        customers,
        suppliers,
        loading
    };
};
