import { Box, styled, TextField, Typography, useTheme } from '@mui/material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import validator from 'validator';
import { z } from 'zod';
import { Button } from '../../components/base/button/Button';
import { ErrorMessage } from '../../components/base/error-message/ErrorMessage';
import { Link } from '../../components/base/link/Link';
import { LoadingOverlay } from '../../components/base/loading-overlay/LoadingOverlay';
import { PaperCard } from '../../components/base/paper-card/PaperCard';
import { FormError } from '../../components/form-error/FormError';
import { PageContainer } from '../../components/page/page-container/PageContainer';
import { PageHeader } from '../../components/page/page-header/PageHeader';
import { routes } from '../../config/navigation/navigation';
import { User, useUserContext } from '../../context/useUserContext';
import { useError } from '../../hooks/useError';
import { StorageToken } from '../../hooks/useToken';
import { errorHasText, handleError } from '../../utils/errorHandling';

type LoginResult = {
  accessToken: StorageToken;
  refreshToken: StorageToken;
  data: User;
};

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

const errorMessages = {
  email: 'A valid email is required',
  password: 'Password is required',
};

const loginInputParser = z.object({
  email: z.string().refine((value) => validator.isEmail(value), { message: errorMessages.email }),
  password: z.string().nonempty({ message: errorMessages.password }),
});

export const Login = () => {
  const theme = useTheme();
  const userContext = useUserContext();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { state } = useLocation();
  const [userData, setUserData] = useState(initialUserData);
  const [loading, setLoading] = useState(false);
  const { error, validatedInput, validateInput } = useError({
    data: userData,
    errorMessages,
    inputParser: loginInputParser,
  });
  const [loginError, setLoginError] = useState('');

  const redirectUrl = useMemo(() => state?.lastVisited ?? routes.posts.route, []);

  const isSubmitDisabled = !validatedInput.success;

  const handleAuthResponse = (accessToken: StorageToken, refreshToken: StorageToken, user: User) => {
    if (!accessToken || !refreshToken) {
      throw new Error('Login failed. Please try again later');
    } else {
      localStorage.setItem('accessToken', JSON.stringify(accessToken));
      localStorage.setItem('refreshToken', JSON.stringify(refreshToken));
      userContext?.setUser(user);
      userContext?.setRefreshTokenExpiration(refreshToken.expiration);
    }
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await axios.post<LoginResult>(
        `${import.meta.env.VITE_AUTH_URL}${routes.login.route}`,
        validatedInput.data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const accessToken = result.data.accessToken;
      const refreshToken = result.data.refreshToken;
      const user = result.data.data;
      handleAuthResponse(accessToken, refreshToken, user);
      navigate(redirectUrl);
    } catch (error: unknown) {
      const errorMessage = 'Incorrect user name or password';
      if (errorHasText(error, [errorMessage])) {
        setLoginError(errorMessage);
      } else {
        handleError(error, enqueueSnackbar);
      }
      setLoading(false);
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
      <PaperCard maxWidth="450px">
        <PageHeader fullWidth title="Login" />
        <StyledForm onSubmit={handleLogin}>
          {loginError && <ErrorMessage>{loginError}</ErrorMessage>}
          <div>
            <TextField
              name="email"
              label="E-Mail"
              type="email"
              value={userData.email}
              required
              fullWidth
              onBlur={() => validateInput('email')}
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
              onBlur={() => validateInput('password')}
              onChange={(event) => handleChange(event, 'password')}
              error={!!error.password}
            />
            {error.password && <FormError>{error.password}</FormError>}
          </div>
          <Button type="submit" disabled={isSubmitDisabled}>
            Login
          </Button>
          <Box>
            <Typography variant="body2" marginTop="12px">
              <Link
                to={routes.register.route}
                color={theme.palette.primary.main}
                hoverColor={theme.palette.primary.light}
                visitedColor={theme.palette.primary.main}
                fontSize="14px"
              >
                Register
              </Link>{' '}
              here
            </Typography>
            <Typography variant="body2" marginTop="8px">
              <Link
                to={routes.forgotPassword.route}
                color={theme.palette.primary.main}
                hoverColor={theme.palette.primary.light}
                visitedColor={theme.palette.primary.main}
                fontSize="14px"
              >
                Forgot password?
              </Link>
            </Typography>
          </Box>
        </StyledForm>
      </PaperCard>
      <LoadingOverlay open={loading} />
    </PageContainer>
  );
};
