import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { AppProvider } from './contexts/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import DashboardView from './components/DashboardView';

// Lazy load pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const WelcomePage = lazy(() => import('./pages/WelcomePage'));
// const DashboardPage = lazy(() => import('./pages/DashboardPage')); // Replaced by DashboardView
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const SuppliersPage = lazy(() => import('./pages/SuppliersPage'));
const InvoicesPage = lazy(() => import('./pages/InvoicesPage'));
const OffersPage = lazy(() => import('./pages/OffersPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const CariPage = lazy(() => import('./pages/CariPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const PersonnelPage = lazy(() => import('./pages/PersonnelPage'));
const ProductMovementsPage = lazy(() => import('./pages/ProductMovementsPage'));
const BrandsPage = lazy(() => import('./pages/BrandsPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('token');
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <ErrorBoundary>
            <AppProvider>
                <Suspense fallback={<div className="flex items-center justify-center h-screen bg-slate-50 text-slate-500">Yükleniyor...</div>}>
                    <Routes>
                        <Route path="/" element={<WelcomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/panel" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                            <Route index element={<DashboardView />} />
                            <Route path="products" element={<ProductsPage />} />
                            <Route path="products/:productId/movements" element={<ProductMovementsPage />} />
                            <Route path="categories" element={<CategoriesPage />} />
                            <Route path="brands" element={<BrandsPage />} />
                            <Route path="customers" element={<CustomersPage />} />
                            <Route path="suppliers" element={<SuppliersPage />} />
                            <Route path="invoices" element={<InvoicesPage />} />
                            <Route path="offers" element={<OffersPage />} />
                            <Route path="orders" element={<OrdersPage />} />
                            <Route path="reports" element={<ReportsPage />} />
                            <Route path="settings" element={<SettingsPage />} />
                            <Route path="cari" element={<CariPage />} />
                            <Route path="account" element={<AccountPage />} />
                            <Route path="personnel" element={<PersonnelPage />} />
                        </Route>
                    </Routes>
                </Suspense>
            </AppProvider>
        </ErrorBoundary>
    );
}

export default App;
