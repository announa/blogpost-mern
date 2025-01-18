import { styled, TextField, Typography, useTheme } from '@mui/material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import validator from 'validator';
import { z } from 'zod';
import { Button } from '../../components/button/Button';
import { FormError } from '../../components/form-error/FormError';
import { Link } from '../../components/link/Link';
import { PageContainer } from '../../components/page-container/PageContainer';
import { PageHeader } from '../../components/page-header/PageHeader';
import { PaperCard } from '../../components/paper-card/PaperCard';
import { routes } from '../../config/navigation/navigation';
import { User, useUserContext } from '../../context/UserContext';
import { handleAxiosError } from '../../utils/error-handling/axiosError';
import { handleZodSafeParseError } from '../../utils/error-handling/zodSafeParseError';

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
  const [userData, setUserData] = useState(initialUserData);
  const [error, setError] = useState(initialUserData);

  if (!userContext) {
    throw new Error('useUserContext must be used within a UserContextProvider');
  }

  const validatedUserData = useMemo(() => loginInputParser.safeParse(userData), [userData]);

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

  const handleAuthResponse = (token: string, user: User) => {
    if (!token) {
      enqueueSnackbar('Login failed. Please try again later', { variant: 'error' });
      setUserData(initialUserData);
      setError(initialUserData);
    } else {
      localStorage.setItem('accessToken', token);
      userContext.setUser(user);
      enqueueSnackbar('Successfully logged in', { variant: 'success' });
    }
  };

  const handleLogin = async () => {
    try {
      const result = await axios.post(
        `${import.meta.env.VITE_AUTH_URL}${routes.login.route}`,
        validatedUserData.data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const token = result.data.accessToken;
      const user = result.data.data;
      handleAuthResponse(token, user);
    } catch (error: unknown) {
      handleAxiosError(error, enqueueSnackbar);
    }
    navigate(routes.posts.route);
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
