import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useContext(AppContext);
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" />;
    }

    // If we have a token but no user yet, we might be loading.
    // However, AppContext doesn't expose loading state directly, 
    // but user is null initially.
    if (!user) {
        // You could return a spinner here
        return <div className="flex items-center justify-center h-full min-h-screen bg-slate-50 text-slate-500">Yetki kontrolü yapılıyor...</div>;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // User role not allowed
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center p-8">
                <div className="text-red-500 text-5xl mb-4">⛔</div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Erişim Reddedildi</h2>
                <p className="text-slate-600">Bu sayfayı görüntülemek için yeterli yetkiniz bulunmamaktadır.</p>
                <p className="text-sm text-slate-400 mt-2">Gerekli Yetki: {allowedRoles.join(' veya ')}</p>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
