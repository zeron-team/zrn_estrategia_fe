// styles/theme.js

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark', // O 'light' si prefieres
    primary: {
      main: '#1976d2', // Un azul estándar
    },
    secondary: {
      main: '#dc004e', // Un rosa para acentos
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
  },
});

export default theme;