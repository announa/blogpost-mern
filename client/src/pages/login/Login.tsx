import { styled, TextField, Typography, useTheme } from '@mui/material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import validator from 'validator';
import { z } from 'zod';
import { Button } from '../../components/base/button/Button';
import { Link } from '../../components/base/link/Link';
import { LoadingOverlay } from '../../components/base/loading-overlay/LoadingOverlay';
import { PaperCard } from '../../components/base/paper-card/PaperCard';
import { FormError } from '../../components/form-error/FormError';
import { PageContainer } from '../../components/page/page-container/PageContainer';
import { PageHeader } from '../../components/page/page-header/PageHeader';
import { routes } from '../../config/navigation/navigation';
import { User, useUserContext } from '../../context/useUserContext';
import { StorageToken } from '../../hooks/useToken';
import { handleError, handleZodSafeParseError } from '../../utils/errorHandling';

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

const loginInputParser = z.object({
  email: z.string().refine((value) => validator.isEmail(value), { message: 'A valid email is required' }),
  password: z.string().nonempty({ message: 'Password is required' }),
});

export const Login = () => {
  const theme = useTheme();
  const userContext = useUserContext();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { state } = useLocation();
  const [userData, setUserData] = useState(initialUserData);
  const [error, setError] = useState(initialUserData);
  const [loading, setLoading] = useState(false);

  const validatedUserData = useMemo(() => loginInputParser.safeParse(userData), [userData]);
  const redirectUrl = useMemo(() => state?.lastVisited ?? routes.posts.route, []);

  useEffect(() => {
    const newError = handleZodSafeParseError(error, validatedUserData);
    setError(newError);
  }, [validatedUserData]);

  const verifyInput = (field: keyof typeof error) => {
    const issue = validatedUserData.error?.issues.find((issue) => issue.path[0] === field);
    if (issue) {
      setError({ ...error, [field]: issue.message });
    }
  };

  const isSubmitDisabled = !validatedUserData.data;

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
        validatedUserData.data,
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
    } catch (error) {
      handleError(error, enqueueSnackbar);
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
        <PageHeader title="Login" textAlign="center" />
        <StyledForm onSubmit={handleLogin}>
          <div>
            <TextField
              name="email"
              label="E-Mail"
              type="email"
              value={userData.email}
              required
              fullWidth
              onBlur={() => verifyInput('email')}
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
              onBlur={() => verifyInput('password')}
              onChange={(event) => handleChange(event, 'password')}
              error={!!error.password}
            />
            {error.password && <FormError>{error.password}</FormError>}
          </div>
          <Button type="submit" disabled={isSubmitDisabled}>
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
      <LoadingOverlay open={loading} />
    </PageContainer>
  );
};
