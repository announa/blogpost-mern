import { ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import { BrowserRouter } from 'react-router-dom';
import { Main } from './Main';
import { theme } from './style/theme';
import { AuthProvider } from './context/AuthContextProvider';

const client = new QueryClient();

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={client}>
        <SnackbarProvider>
          <BrowserRouter>
            <AuthProvider>
              <Main />
            </AuthProvider>
          </BrowserRouter>
        </SnackbarProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
