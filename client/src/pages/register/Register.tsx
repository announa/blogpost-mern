import { styled, TextField, Typography, useTheme } from '@mui/material';
import axios from 'axios';
import { isEqual } from 'lodash';
import { useSnackbar } from 'notistack';
import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/button/Button';
import { Link } from '../../components/link/Link';
import { PageContainer } from '../../components/page-container/PageContainer';
import { PageHeader } from '../../components/page-header/PageHeader';
import { PaperCard } from '../../components/paper-card/PaperCard';
import { routes } from '../../config/navigation/navigation';
import { handleAxiosError } from '../../utils/error-handling/errorHandling';

const StyledForm = styled('form')({
  width: '100%',
  maxWidth: '500px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

const initialUserData = {
  firstName: '',
  lastName: '',
  email: '',
  userName: '',
  password: '',
};

export const Register = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(initialUserData);
  const [repeatPassword, setRepeatPassword] = useState('');

  const isSubmitDisabled = useMemo(() => isEqual(userData, initialUserData), [userData]);

  const handleRegistration = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await axios.post(`${import.meta.env.VITE_AUTH_URL}${routes.register.route}`, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      enqueueSnackbar('User successfully added', { variant: 'success' });
      navigate(routes.login.route);
    } catch (error: unknown) {
      handleAxiosError(error, enqueueSnackbar);
    }
  };
  return (
    <PageContainer>
      <PaperCard maxWidth="500px" padding="50px">
        <PageHeader title="Register" textAlign="center" />
        <StyledForm onSubmit={handleRegistration}>
          <TextField
            name="firstName"
            label="First Name"
            type="text"
            value={userData.firstName}
            onChange={(event) => setUserData({ ...userData, firstName: event.target.value })}
          />
          <TextField
            name="lastName"
            label="Last Name"
            type="text"
            value={userData.lastName}
            onChange={(event) => setUserData({ ...userData, lastName: event.target.value })}
          />
          <TextField
            name="userName"
            label="User Name"
            type="text"
            value={userData.userName}
            onChange={(event) => setUserData({ ...userData, userName: event.target.value })}
          />
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
          <TextField
            name="repeat-password"
            label="Repeat Password"
            type="password"
            value={repeatPassword}
            onChange={(event) => setRepeatPassword(event.target.value)}
          />
          <Button type="submit" disabled={isSubmitDisabled}>
            Register
          </Button>
          <Typography variant="body2">
            Already got an account? Go to{' '}
            <Link
              to={routes.login.route}
              color={theme.palette.primary.main}
              hoverColor={theme.palette.primary.light}
              visitedColor={theme.palette.primary.main}
              fontSize="14px"
            >
              Login
            </Link>{' '}
          </Typography>
        </StyledForm>
      </PaperCard>
    </PageContainer>
  );
};
