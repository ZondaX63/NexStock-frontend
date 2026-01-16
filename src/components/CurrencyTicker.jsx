import React, { useState, useEffect } from 'react';
import api from '../api';
import { TrendingUp, Refresh } from '@mui/icons-material';

const CurrencyTicker = () => {
    const [rates, setRates] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchRates = async () => {
        try {
            setLoading(true);
            const res = await api.get('/currency');
            setRates(res.data);
            setError(false);
        } catch (err) {
            console.error('Rates fetch error:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates();
        // Her 30 dakikada bir güncelle
        const interval = setInterval(fetchRates, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !rates) {
        return (
            <div className="flex items-center space-x-4 px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse">
                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
        );
    }

    if (error && !rates) return null;

    return (
        <div className="flex items-center space-x-3 md:space-x-6 px-4 py-1.5 bg-indigo-50/50 dark:bg-slate-800/50 border border-indigo-100 dark:border-slate-700 rounded-full transition-all hover:bg-indigo-50 dark:hover:bg-slate-800">
            <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-indigo-400 dark:text-indigo-300 uppercase tracking-wider">USD</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">₺{rates?.USD?.rate}</span>
                <TrendingUp className="w-3 h-3 text-emerald-500" />
            </div>

            <div className="w-px h-4 bg-indigo-200 dark:bg-slate-700 hidden sm:block"></div>

            <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-indigo-400 dark:text-indigo-300 uppercase tracking-wider">EUR</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">₺{rates?.EUR?.rate}</span>
                <TrendingUp className="w-3 h-3 text-emerald-500" />
            </div>

            <button
                onClick={fetchRates}
                className="p-1 text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors rounded-full hover:bg-indigo-100 dark:hover:bg-slate-700"
                title="Kuru Güncelle"
            >
                <Refresh className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>
    );
};

export default CurrencyTicker;
