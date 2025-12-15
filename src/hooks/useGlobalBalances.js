import { useState, useEffect, useCallback, useContext } from 'react';
import api from '../api';
import { AppContext } from '../contexts/AppContext';

export const useGlobalBalances = () => {
    const { refreshTriggers } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const [balances, setBalances] = useState({
        totalCash: 0,        // Company assets (Cash + Bank + Credit Card + Personnel)
        totalReceivables: 0, // Money owed to us (Positive Customer Balance)
        totalPayables: 0,    // Money we owe (Positive Supplier Balance)
        netWorth: 0,         // totalCash + totalReceivables - totalPayables
        companyAccounts: [],
        customers: [],
        suppliers: []
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [accountsRes, customersRes, suppliersRes] = await Promise.all([
                api.get('/accounts'),
                api.get('/customers'),
                api.get('/suppliers')
            ]);

            const accounts = accountsRes.data || [];
            const customersData = customersRes.data.customers || customersRes.data.docs || customersRes.data || [];
            const suppliersData = suppliersRes.data.suppliers || suppliersRes.data.docs || suppliersRes.data || [];

            // 1. Calculate Company Assets
            const companyAccounts = accounts.filter(acc =>
                ['cash', 'bank', 'credit_card', 'personnel'].includes(acc.type)
            );
            const totalCash = companyAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

            // 2. Calculate Receivables and Payables using the new 'balance' field
            // Customer Balance > 0: They owe us (Receivable)
            // Customer Balance < 0: We owe them (Payable - e.g. overpayment)
            // Supplier Balance > 0: We owe them (Payable)
            // Supplier Balance < 0: They owe us (Receivable - e.g. advance payment)

            let totalReceivables = 0;
            let totalPayables = 0;

            customersData.forEach(c => {
                const balance = c.balance || 0;
                if (balance > 0) totalReceivables += balance;
                else if (balance < 0) totalPayables += Math.abs(balance);
            });

            suppliersData.forEach(s => {
                const balance = s.balance || 0;
                if (balance > 0) totalPayables += balance;
                else if (balance < 0) totalReceivables += Math.abs(balance);
            });

            setBalances({
                totalCash,
                totalReceivables,
                totalPayables,
                netWorth: totalCash + totalReceivables - totalPayables,
                companyAccounts,
                customers: customersData,
                suppliers: suppliersData
            });

        } catch (error) {
            console.error('Error calculating global balances:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData, refreshTriggers]);

    return { ...balances, loading, refreshBalances: fetchData };
};
