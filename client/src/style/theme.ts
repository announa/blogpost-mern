import { createTheme } from '@mui/material';
import { blue } from '@mui/material/colors';

export const theme = createTheme({
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#f5f5f5',
        },
      },
    },
  },
});
