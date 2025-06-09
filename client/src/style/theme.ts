import { createTheme } from '@mui/material';

declare module '@mui/material/styles' {
  interface PaletteColor {
    hover?: string;
    shadow?: string;
  }
  
  interface SimplePaletteColorOptions {
    hover?: string;
    shadow?: string;
  }
}

export let theme = createTheme({
  palette: {
    primary: {
      main: '#ffc81d',
      light: '#ffd658',
      dark: '#f4b800',
      shadow: '#ffdb4b',
      hover: '#fff4cc',
    },
  },
});

theme = createTheme(theme, {
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          boxShadow: 'none',
          color: 'white',
          background: theme.palette.primary.main,
          // fontSize: '15px',
          fontWeight: 700,
          // color: '#714900',
          '&:hover': {
            background: theme.palette.primary.main,
            boxShadow: `3px 3px 5px ${theme.palette.primary.shadow}`,
          },
          '&:focus': {
            outline: 'none'
          }
        },
        outlined: {
          '&:hover': {
            borderColor: theme.palette.primary.dark,
            color: theme.palette.primary.dark,
          },
        },
      },
    },
    MuiIconButton: {
      root: {
        styleOverrides: {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
  },
});
