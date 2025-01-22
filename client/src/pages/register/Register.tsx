import { styled, TextField, Typography, useTheme } from '@mui/material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import validator from 'validator';
import { z } from 'zod';
import { Button } from '../../components/base/button/Button';
import { ErrorMessage } from '../../components/base/error-message/ErrorMessage';
import { Link } from '../../components/base/link/Link';
import { PaperCard } from '../../components/base/paper-card/PaperCard';
import { PageContainer } from '../../components/page/page-container/PageContainer';
import { PageHeader } from '../../components/page/page-header/PageHeader';
import { routes } from '../../config/navigation/navigation';
import { useError } from '../../hooks/useError';
import { handleError } from '../../utils/errorHandling';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*+?&()"#^-])[A-Za-z\d@$!%*+?&()"#^-]{8,}$/;

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
  userName: '',
  email: '',
  password: '',
  repeatPassword: '',
};

const errorMessages = {
  firstName: 'First name is required',
  lastName: 'Last name is required',
  userName: 'User name is required',
  email: 'A valid email is required',
  password:
    'Invalid password. The password must contain at least 8 characters with at least one lower case and one upper case letter, one number and one special character @$!%*+?&()"#^-',
  repeatPassword: 'Must be the same as password',
};

const registerInputParser = z
  .object({
    firstName: z.string().nonempty({ message: errorMessages.firstName }),
    lastName: z.string().nonempty({ message: errorMessages.lastName }),
    userName: z.string().nonempty({ message: errorMessages.userName }),
    email: z.string().refine((value) => validator.isEmail(value), { message: errorMessages.email }),
    password: z
      .string()
      .nonempty()
      .refine((password) => PASSWORD_REGEX.test(password), errorMessages.password),
    repeatPassword: z.string().nonempty({ message: errorMessages.repeatPassword }),
  })
  .superRefine((input, ctx) => {
    if (input.password !== input.repeatPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['repeatPassword'],
        message: errorMessages.repeatPassword,
      });
    }
  });

export const Register = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(initialUserData);
  const { error, validateInput, validatedInput } = useError({
    data: userData,
    errorMessages,
    inputParser: registerInputParser,
  });

  const isSubmitDisabled = useMemo(() => !validatedInput.success, [validatedInput]);

  const handleRegistration = async (event: FormEvent) => {
    event.preventDefault();
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { repeatPassword, ...data } = userData;
      await axios.post(`${import.meta.env.VITE_AUTH_URL}${routes.register.route}`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      enqueueSnackbar('User successfully added', { variant: 'success', autoHideDuration: 3000 });
      navigate(routes.login.route);
    } catch (error: unknown) {
      handleError(error, enqueueSnackbar);
    }
  };

  return (
    <PageContainer>
      <PaperCard maxWidth="450px" maxHeight="unset" marginBottom="50px">
        <PageHeader title="Register" textAlign="center" />
        <StyledForm onSubmit={handleRegistration}>
          <div>
            <TextField
              name="firstName"
              label="First Name"
              type="text"
              required
              fullWidth
              value={userData.firstName}
              onBlur={() => validateInput('firstName')}
              onChange={(event) => setUserData({ ...userData, firstName: event.target.value })}
              error={!!error.firstName}
            />
            {error.firstName && <ErrorMessage>{error.firstName}</ErrorMessage>}
          </div>
          <div>
            <TextField
              name="lastName"
              label="Last Name"
              type="text"
              required
              fullWidth
              value={userData.lastName}
              onBlur={() => validateInput('lastName')}
              onChange={(event) => setUserData({ ...userData, lastName: event.target.value })}
              error={!!error.lastName}
            />
            {error.lastName && <ErrorMessage>{error.lastName}</ErrorMessage>}
          </div>
          <div>
            <TextField
              name="userName"
              label="User Name"
              type="text"
              required
              fullWidth
              onBlur={() => validateInput('userName')}
              value={userData.userName}
              onChange={(event) => setUserData({ ...userData, userName: event.target.value })}
              error={!!error.userName}
            />
            {error.userName && <ErrorMessage>{error.userName}</ErrorMessage>}
          </div>
          <div>
            <TextField
              name="email"
              label="E-Mail"
              type="email"
              required
              fullWidth
              onBlur={() => validateInput('email')}
              value={userData.email}
              onChange={(event) => setUserData({ ...userData, email: event.target.value })}
              error={!!error.email}
            />
            {error.email && <ErrorMessage>{error.email}</ErrorMessage>}
          </div>
          <div>
            <TextField
              name="password"
              label="Enter Password"
              type="password"
              required
              fullWidth
              onBlur={() => {
                validateInput('password');
                if (userData.repeatPassword) validateInput('repeatPassword');
              }}
              value={userData.password}
              onChange={(event) => setUserData({ ...userData, password: event.target.value })}
              error={!!error.password}
            />
            {error.password && <ErrorMessage>{error.password}</ErrorMessage>}
          </div>
          <div>
            <TextField
              name="repeatPassword"
              label="Repeat Password"
              type="password"
              required
              fullWidth
              onBlur={() => validateInput('repeatPassword')}
              value={userData.repeatPassword}
              onChange={(event) => setUserData({ ...userData, repeatPassword: event.target.value })}
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
