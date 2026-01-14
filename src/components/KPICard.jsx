import React from 'react';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const KPICard = ({ title, value, trend, isPositive, icon, isWarning }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-2">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${isWarning ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-500' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500'}`}>
                    {icon}
                </div>
            </div>
            <div className="mt-4 flex items-center">
                <span className={`flex items-center text-sm font-semibold ${isPositive ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full' : 'text-red-600 bg-red-50 px-2 py-0.5 rounded-full'}`}>
                    {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                    {trend}
                </span>
                <span className="text-sm text-slate-400 ml-2">geçen aya göre</span>
            </div>
        </div>
    );
};

export default KPICard;
