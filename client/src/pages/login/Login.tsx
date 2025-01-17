import { styled, TextField, Typography, useTheme } from '@mui/material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { Button } from '../../components/button/Button';
import { PageContainer } from '../../components/page-container/PageContainer';
import { PageHeader } from '../../components/page-header/PageHeader';
import { PaperCard } from '../../components/paper-card/PaperCard';
import { routes } from '../../config/navigation/navigation';
import { handleAxiosError } from '../../utils/error-handling/errorHandling';
import { Link } from '../../components/link/Link';

const StyledForm = styled('form')({
  width: '100%',
  maxWidth: '500px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

const initialUserData = {
  email: '',
  password: '',
};

export const Login = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [userData, setUserData] = useState(initialUserData);

  const handleLogin = async () => {
    try {
      const result = await axios.post(`${import.meta.env.VITE_AUTH_URL}${routes.login.route}`, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      enqueueSnackbar('Successfully loged in', { variant: 'success' });
    } catch (error: unknown) {
      handleAxiosError(error, enqueueSnackbar);
    }
  };

  return (
    <PageContainer>
      <PaperCard maxWidth="500px" padding="50px">
        <PageHeader title="Login" textAlign="center" />
        <StyledForm>
          <TextField
            name="email"
            label="E-Mail"
            type="email"
            value={userData.email}
            onChange={(event) => setUserData({ ...userData, email: event.target.value })}
          />
          <TextField
            name="password"
            label="Enter Password"
            type="password"
            value={userData.password}
            onChange={(event) => setUserData({ ...userData, password: event.target.value })}
          />
          <Button onClick={handleLogin}>Login</Button>
          <Typography variant="body2">
            Not registered yet?{' '}
            <Link
              to={routes.register.route}
              color={theme.palette.primary.main}
              hoverColor={theme.palette.primary.light}
              visitedColor={theme.palette.primary.main}
              fontSize="14px"
            >
              Register
            </Link>{' '}
            first
          </Typography>
        </StyledForm>
      </PaperCard>
    </PageContainer>
  );
};
