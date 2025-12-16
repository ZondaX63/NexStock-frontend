import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [refreshTriggers, setRefreshTriggers] = useState({
    customers: 0,
    suppliers: 0,
    accounts: 0,
    products: 0,
    invoices: 0,
    transactions: 0
  });

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      // Suppress noisy logs for unauthorized (no token / expired)
      if (error.response?.status === 401) return;
      console.error('Failed to fetch user:', error);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      // If unauthorized, stop noisy logging and clear notifications
      if (error.response?.status === 401) {
        setNotifications([]);
        return;
      }
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  // Global refresh fonksiyonu - belirli veri türlerini yeniden yüklenmesini tetikler
  const triggerRefresh = useCallback((dataTypes) => {
    const types = Array.isArray(dataTypes) ? dataTypes : [dataTypes];
    setRefreshTriggers(prev => {
      const updated = { ...prev };
      types.forEach(type => {
        if (updated.hasOwnProperty(type)) {
          updated[type] = prev[type] + 1;
        }
      });
      return updated;
    });
  }, []);

  useEffect(() => {
    // Initial fetch only if token present
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
      fetchNotifications();
    }

    // Poller: check token on each tick and fetch notifications only when authorized
    const interval = setInterval(() => {
      const t = localStorage.getItem('token');
      if (t) {
        fetchNotifications();
      } else {
        // ensure UI doesn't show stale notifications when logged out
        setNotifications([]);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUser, fetchNotifications]);

  return (
    <AppContext.Provider value={{ 
      user, 
      notifications, 
      setUser, 
      setNotifications, 
      refreshTriggers, 
      triggerRefresh 
    }}>
      {children}
    </AppContext.Provider>
  );
};
