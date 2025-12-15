import { createTheme } from '@mui/material/styles';


const theme = createTheme({
  palette: {
    primary: { main: '#2d3e50', contrastText: '#fff' }, // Kurumsal koyu mavi
    secondary: { main: '#764ba2', contrastText: '#fff' }, // Mor
    success: { main: '#43a047', contrastText: '#fff' }, // Yeşil
    warning: { main: '#ffb300', contrastText: '#fff' }, // Sarı
    error: { main: '#e53935', contrastText: '#fff' }, // Kırmızı
    info: { main: '#1976d2', contrastText: '#fff' }, // Açık mavi
    background: {
      default: '#f4f6fa', // Hafif mavi-gri, profesyonel
      paper: '#fff',
      card: '#f9fafd',
      sidebar: '#2d3e50',
      appbar: '#fff',
    },
    text: {
      primary: '#222',
      secondary: '#555',
      disabled: '#b0b3b8',
    },
    divider: '#e0e3e7',
    chip: {
      sale: '#43a047',
      purchase: '#1976d2',
      draft: '#ffb300',
      approved: '#764ba2',
      paid: '#2d3e50',
      canceled: '#e53935',
    },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 4px 24px rgba(44,62,80,0.07)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 4px 24px rgba(44,62,80,0.07)',
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 10,
          textTransform: 'none',
          boxShadow: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          letterSpacing: 0.2,
        },
      },
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: { fontWeight: 800, fontSize: '2.8rem', color: '#2d3e50' },
    h2: { fontWeight: 700, fontSize: '2.2rem', color: '#2d3e50' },
    h3: { fontWeight: 700, fontSize: '1.8rem', color: '#2d3e50' },
    h4: { fontWeight: 700, fontSize: '1.5rem', color: '#2d3e50' },
    h5: { fontWeight: 600, color: '#2d3e50' },
    h6: { fontWeight: 600, color: '#2d3e50' },
    subtitle1: { color: '#555' },
    subtitle2: { color: '#555' },
    body1: { color: '#222' },
    body2: { color: '#555' },
    button: { fontWeight: 600 },
  },
});

export default theme;
