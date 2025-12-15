import { AppThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <AppThemeProvider>
      {/* ... mevcut router ve içerik ... */}
    </AppThemeProvider>
  );
}

export default App;