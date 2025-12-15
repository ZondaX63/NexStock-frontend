import React, { createContext, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import theme from '../theme/theme';

export const ThemeContext = createContext({
  toggleTheme: () => {},
});

export const AppThemeProvider = ({ children }) => {
  // Eski haliyle sadece light theme
  const [themeMode] = useState('light');
  const themeValue = useMemo(() => ({
    toggleTheme: () => {},
  }), []);
  return (
    <ThemeContext.Provider value={themeValue}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};