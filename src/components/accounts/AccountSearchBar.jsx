import React from 'react';
import { Search, FilterList } from '@mui/icons-material';

const AccountSearchBar = ({ search, setSearch, filter, setFilter }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="block w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm"
                        placeholder="Hesap adı ile ara..."
                    />
                </div>

                <div className="flex items-center gap-2">
                    <FilterList className="h-5 w-5 text-slate-400" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="block w-full sm:w-48 border border-slate-300 rounded-lg bg-white text-slate-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm"
                    >
                        <option value="all">Tüm Hesaplar</option>
                        <option value="company">Şirket Hesapları</option>
                        <option value="customer">Müşteri Hesapları</option>
                        <option value="supplier">Tedarikçi Hesapları</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default AccountSearchBar;
