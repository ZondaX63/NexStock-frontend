import React, { useContext, useState } from 'react';
import {
    Menu as MenuIcon,
    Notifications
} from '@mui/icons-material';
import { AppContext } from '../contexts/AppContext';
import CurrencyTicker from './CurrencyTicker';

const Topbar = ({ toggleSidebar }) => {
    const { notifications, user, markNotificationRead, markAllNotificationsRead } = useContext(AppContext);
    const [showNotifications, setShowNotifications] = useState(false);

    // Unread count calculation (assuming 'read' field exists)
    const unreadCount = notifications.filter(n => !n.read).length;

    const displayName = user ? (user.name || user.username || user.email || 'Kullanıcı') : 'Giriş yok';
    const roleLabel = user?.role ? (user.role === 'admin' ? 'Yönetici' : user.role) : '';
    const initials = user ? (
        user.name ? user.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : (user.username ? user.username.slice(0,2).toUpperCase() : 'NS')
    ) : 'NS';

    return (
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 h-20 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-20 transition-colors duration-200">
            <div className="flex items-center">
                <button onClick={toggleSidebar} className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden">
                    <MenuIcon />
                </button>
                {/* Hızlı arama kaldırıldı */}
            </div>
            <div className="flex items-center space-x-6">
                <div className="hidden lg:block">
                    <CurrencyTicker />
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                    >
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                        )}
                        <Notifications />
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 py-1 focus:outline-none z-50">
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Bildirimler</h3>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={markAllNotificationsRead}
                                                className="text-xs px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                Tümünü Okundu Yap
                                            </button>
                                        </div>
                                    </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400 text-center">
                                        Yeni bildirim yok
                                    </div>
                                ) : (
                                    notifications.map((notif, index) => (
                                        <div key={notif._id || index} className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 border-b border-gray-50 dark:border-slate-700 last:border-0 transition-colors flex items-start justify-between gap-4 ${notif.read ? 'opacity-80' : ''}`}>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-800 dark:text-slate-200">{notif.message}</p>
                                                <p className="text-xs text-gray-400 mt-1">{new Date(notif.date).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!notif.read && (
                                                    <button
                                                        onClick={() => markNotificationRead(notif._id)}
                                                        className="text-xs px-2 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                                                    >
                                                        Okundu
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => { /* future: delete notification */ }}
                                                    className="text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                >
                                                    •
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center pl-6 border-l border-slate-200">
                    <div className="flex flex-col items-end mr-3 hidden md:flex">
                        <span className="text-sm font-semibold text-slate-700">{displayName}</span>
                        {roleLabel && <span className="text-xs text-slate-500">{roleLabel}</span>}
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30 ring-2 ring-white cursor-pointer">
                        {initials}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
