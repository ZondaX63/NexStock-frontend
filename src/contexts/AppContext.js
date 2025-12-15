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
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
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
    fetchUser();
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
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
