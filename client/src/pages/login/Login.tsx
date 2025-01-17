import { styled, TextField, Typography, useTheme } from '@mui/material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import validator from 'validator';
import { z } from 'zod';
import { Button } from '../../components/button/Button';
import { FormError } from '../../components/form-error/FormError';
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
  email: '',
  password: '',
};

const emailParser = z
  .string()
  .refine((value) => validator.isEmail(value), { message: 'A valid email is required' });

export const Login = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [userData, setUserData] = useState(initialUserData);
  const [error, setError] = useState(initialUserData);

  const validatedEmail = useMemo(() => emailParser.safeParse(userData.email), [userData.email]);

  useEffect(() => {
    if (validatedEmail.data) {
      setError({ ...error, email: '' });
    }
  }, [validatedEmail, error]);

  useEffect(() => {
    if (userData.password.length > 0) {
      setError({ ...error, password: '' });
    }
  }, [userData.password, error]);

  const isSubmitDisabled = !validatedEmail.data || !userData.password;

  const handleLogin = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_AUTH_URL}${routes.login.route}`, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      enqueueSnackbar('Successfully loged in', { variant: 'success' });
    } catch (error: unknown) {
      handleAxiosError(error, enqueueSnackbar);
    }
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: 'email' | 'password'
  ) => {
    const value = event.target.value;
    setUserData({ ...userData, [field]: value });
  };

  return (
    <PageContainer>
      <PaperCard maxWidth="500px" padding="50px">
        <PageHeader title="Login" textAlign="center" />
        <StyledForm>
          <div>
            <TextField
              name="email"
              label="E-Mail"
              type="email"
              value={userData.email}
              required
              fullWidth
              onBlur={() =>
                setError({ ...error, email: validatedEmail.data ? '' : 'A valid Email is required' })
              }
              onChange={(event) => handleChange(event, 'email')}
              error={!!error.email}
            />
            {error.email && <FormError>{error.email}</FormError>}
          </div>
          <div>
            <TextField
              name="password"
              label="Enter Password"
              type="password"
              value={userData.password}
              required
              fullWidth
              onBlur={() => setError({ ...error, password: userData.password ? '' : 'Password is required' })}
              onChange={(event) => handleChange(event, 'password')}
              error={!!error.password}
            />
            {error.password && <FormError>{error.password}</FormError>}
          </div>
          <Button onClick={handleLogin} disabled={isSubmitDisabled}>
            Login
          </Button>
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
