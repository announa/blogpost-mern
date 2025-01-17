import { styled, TextField, Typography, useTheme } from '@mui/material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import validator from 'validator';
import { z } from 'zod';
import { Button } from '../../components/button/Button';
import { Link } from '../../components/link/Link';
import { PageContainer } from '../../components/page-container/PageContainer';
import { PageHeader } from '../../components/page-header/PageHeader';
import { PaperCard } from '../../components/paper-card/PaperCard';
import { routes } from '../../config/navigation/navigation';
import { handleAxiosError } from '../../utils/error-handling/errorHandling';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&()"#^-]{8,}$/;

const StyledForm = styled('form')({
  width: '100%',
  maxWidth: '500px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

const ErrorMessage = styled('p')({
  margin: 0,
  fontSize: '12px',
  color: 'red',
});

enum UserDataKeys {
  firstName = 'firstName',
  lastName = 'lastName',
  email = 'email',
  userName = 'userName',
  password = 'password',
  repeatPassword = 'repeatPassword',
}

const initialUserData = {
  firstName: '',
  lastName: '',
  userName: '',
  email: '',
  password: '',
};

const initialError = {
  firstName: { success: false, message: 'First name is required' },
  lastName: { success: false, message: 'Last name is required' },
  userName: { success: false, message: 'User name is required' },
  email: { success: false, message: 'A valid email is required' },
  password: {
    success: false,
    message:
      'Invalid password. The password must contain at least 8 characters with at least one lower case and one upper case letter, one number and one special character @$!%*?&()"#^-',
  },
  repeatPassword: {
    success: false,
    message: 'Must be the same as password',
  },
};

const registerInputParser = z
  .object({
    firstName: z.string().nonempty({ message: initialError.firstName.message }),
    lastName: z.string().nonempty({ message: initialError.lastName.message }),
    userName: z.string().nonempty({ message: initialError.userName.message }),
    email: z.string().refine((value) => validator.isEmail(value), { message: initialError.email.message }),
    password: z
      .string()
      .nonempty()
      .refine((password) => PASSWORD_REGEX.test(password), initialError.password.message),
    repeatPassword: z.string().nonempty({ message: initialError.repeatPassword.message }),
  })
  .superRefine((input, ctx) => {
    if (input.password !== input.repeatPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [UserDataKeys.repeatPassword],
        message: initialError.repeatPassword.message,
      });
    }
  });

export const Register = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(initialUserData);
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState({ ...initialUserData, repeatPassword: '' });

  const validatedUserData = useMemo(() => {
    const validatedUserData = registerInputParser.safeParse({ ...userData, repeatPassword: repeatPassword });
    return validatedUserData;
  }, [userData, repeatPassword]);

  useEffect(() => {
    const allErrorFields = Object.keys(error);
    const activeErrorFields = validatedUserData.error?.issues.map((issue) => issue.path[0]);
    const noErrorFields = allErrorFields.filter((field) => !activeErrorFields?.includes(field));
    let newError = { ...error };
    for (const key of noErrorFields) {
      newError = { ...newError, [key]: '' };
    }
    setError(newError);
  }, [validatedUserData]);

  const verifyInput = (field: keyof typeof error) => {
    const hasError = validatedUserData.error?.issues.find((issue) => issue.path[0] === field);
    if (hasError) {
      setError({ ...error, [field]: initialError[field].message });
    }
  };

  const isSubmitDisabled = useMemo(() => !validatedUserData.success, [validatedUserData]);

  const handleRegistration = async (event: FormEvent) => {
    event.preventDefault();
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
          <div>
            <TextField
              name={UserDataKeys.firstName}
              label="First Name"
              type="text"
              required
              fullWidth
              value={userData.firstName}
              onBlur={() => verifyInput(UserDataKeys.firstName)}
              onChange={(event) => setUserData({ ...userData, firstName: event.target.value })}
              error={!!error.firstName}
            />
            {error.firstName && <ErrorMessage>{error.firstName}</ErrorMessage>}
          </div>
          <div>
            <TextField
              name={UserDataKeys.lastName}
              label="Last Name"
              type="text"
              required
              fullWidth
              value={userData.lastName}
              onBlur={() => verifyInput(UserDataKeys.lastName)}
              onChange={(event) => setUserData({ ...userData, lastName: event.target.value })}
              error={!!error.lastName}
            />
            {error.lastName && <ErrorMessage>{error.lastName}</ErrorMessage>}
          </div>
          <div>
            <TextField
              name={UserDataKeys.userName}
              label="User Name"
              type="text"
              required
              fullWidth
              onBlur={() => verifyInput(UserDataKeys.userName)}
              value={userData.userName}
              onChange={(event) => setUserData({ ...userData, userName: event.target.value })}
              error={!!error.userName}
            />
            {error.userName && <ErrorMessage>{error.userName}</ErrorMessage>}
          </div>
          <div>
            <TextField
              name={UserDataKeys.email}
              label="E-Mail"
              type="email"
              required
              fullWidth
              onBlur={() => verifyInput(UserDataKeys.email)}
              value={userData.email}
              onChange={(event) => setUserData({ ...userData, email: event.target.value })}
              error={!!error.email}
            />
            {error.email && <ErrorMessage>{error.email}</ErrorMessage>}
          </div>
          <div>
            <TextField
              name={UserDataKeys.password}
              label="Enter Password"
              type="password"
              required
              fullWidth
              onBlur={() => verifyInput(UserDataKeys.password)}
              value={userData.password}
              onChange={(event) => setUserData({ ...userData, password: event.target.value })}
              error={!!error.password}
            />
            {error.password && <ErrorMessage>{error.password}</ErrorMessage>}
          </div>
          <div>
            <TextField
              name={UserDataKeys.repeatPassword}
              label="Repeat Password"
              type="password"
              required
              fullWidth
              onBlur={() => verifyInput(UserDataKeys.repeatPassword)}
              value={repeatPassword}
              onChange={(event) => setRepeatPassword(event.target.value)}
              error={!!error.repeatPassword}
            />
            {error.repeatPassword && <ErrorMessage>{error.repeatPassword}</ErrorMessage>}
          </div>
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
