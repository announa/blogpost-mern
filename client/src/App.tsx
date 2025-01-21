import { ThemeProvider } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { BrowserRouter } from 'react-router-dom';
import { UserContextProvider } from './context/UserContextProvider';
import { Main } from './Main';
import { theme } from './style/theme';

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <UserContextProvider>
        <SnackbarProvider>
          <BrowserRouter>
            <Main />
          </BrowserRouter>
        </SnackbarProvider>
      </UserContextProvider>
    </ThemeProvider>
  );
};

export default App;
