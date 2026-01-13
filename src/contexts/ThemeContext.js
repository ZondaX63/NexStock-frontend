import React, { createContext, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import theme from '../theme/theme';

export const ThemeContext = createContext({
  toggleTheme: () => { },
});

export const AppThemeProvider = ({ children }) => {
  const themeValue = useMemo(() => ({
    toggleTheme: () => { },
  }), []);
  return (
    <ThemeContext.Provider value={themeValue}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};