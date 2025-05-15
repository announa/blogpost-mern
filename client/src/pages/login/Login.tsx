import { Box, TextField, Typography, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import validator from 'validator';
import { z } from 'zod';
import { Button } from '../../components/base/button/Button';
import { ErrorMessage } from '../../components/base/error-message/ErrorMessage';
import { FormContainer } from '../../components/base/form-container/FormContainer';
import { Link } from '../../components/base/link/Link';
import { LoadingOverlay } from '../../components/base/loading-overlay/LoadingOverlay';
import { PaperCard } from '../../components/base/paper-card/PaperCard';
import { FormError } from '../../components/form-error/FormError';
import { PageContainer } from '../../components/page/page-container/PageContainer';
import { PageHeader } from '../../components/page/page-header/PageHeader';
import { routes } from '../../config/navigation/navigation';
import { useAuthContext } from '../../context/useAuthContext';
import { useError } from '../../hooks/useError';
import { errorContainsStrings, handleError } from '../../utils/errorHandling';

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

const LOGIN_CREDENTIALS_ERROR_MESSAGE = 'Incorrect user name or password';

export const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login, loading, loginError } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { state, pathname } = useLocation();
  const [userData, setUserData] = useState(initialUserData);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [loginCredentialsError, setLoginCredentialsError] = useState(false);
  const { error, validatedInput, validateInput } = useError({
    data: userData,
    errorMessages,
    inputParser: loginInputParser,
  });

  useEffect(() => {
    setRedirectUrl(state?.lastVisited ?? routes.posts.route);
    setLoginCredentialsError(false);
    navigate(pathname, { replace: true });
  }, [state]);

  useEffect(() => {
    if (!loginError) return;
    if (errorContainsStrings(loginError, [LOGIN_CREDENTIALS_ERROR_MESSAGE])) {
      setLoginCredentialsError(true);
    } else {
      handleError(loginError, enqueueSnackbar);
    }
  }, [loginError, enqueueSnackbar]);

  const isSubmitDisabled = !validatedInput.success;

  const handleLogin = (event: FormEvent) => {
    event.preventDefault();
    if (validatedInput.data) {
      login(validatedInput.data, redirectUrl);
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
      <PaperCard maxWidth="450px" background="#efefef" cardProps={{ padding: '50px' }}>
        <PageHeader title="Login" textAlign="center" typographyProps={{ width: '100%' }} />
        <FormContainer onSubmit={handleLogin}>
          {loginCredentialsError && <ErrorMessage>{LOGIN_CREDENTIALS_ERROR_MESSAGE}</ErrorMessage>}
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
              slotProps={{ input: { sx: { background: 'white' } } }}
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
              slotProps={{ input: { sx: { background: 'white' } } }}
              error={!!error.password}
            />
            {error.password && <FormError>{error.password}</FormError>}
          </div>
          <Button type="submit" disabled={isSubmitDisabled}>
            Login
          </Button>
          <Box>
            <Typography variant="body2" marginTop="12px">
              Don't have an account? &nbsp;
              <Link
                to={routes.register.route}
                color={theme.palette.primary.main}
                hoverColor={theme.palette.primary.light}
                visitedColor={theme.palette.primary.main}
                fontSize="14px"
              >
                Register
              </Link>
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
        </FormContainer>
      </PaperCard>
      <LoadingOverlay open={loading} />
    </PageContainer>
  );
};
