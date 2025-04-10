import { Typography, useTheme } from '@mui/material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import validator from 'validator';
import { z } from 'zod';
import { Link } from '../../components/base/link/Link';
import { LoadingOverlay } from '../../components/base/loading-overlay/LoadingOverlay';
import { PaperCard } from '../../components/base/paper-card/PaperCard';
import { PageContainer } from '../../components/page/page-container/PageContainer';
import { PageHeader } from '../../components/page/page-header/PageHeader';
import { routes } from '../../config/navigation/navigation';
import { useError } from '../../hooks/useError';
import { handleError } from '../../utils/errorHandling';
import { UserData, UserForm } from '../account-settings/form/UserForm';
import { initialUserData, PASSWORD_REGEX, userErrorMessages } from '../account-settings/form/utils';

const userInputParser = z
  .object({
    firstName: z.string().nonempty({ message: userErrorMessages.firstName }),
    lastName: z.string().nonempty({ message: userErrorMessages.lastName }),
    userName: z.string().nonempty({ message: userErrorMessages.userName }),
    email: z.string().refine((value) => validator.isEmail(value), { message: userErrorMessages.email }),
    password: z
      .string()
      .nonempty()
      .refine((password) => PASSWORD_REGEX.test(password), userErrorMessages.password),
    repeatPassword: z.string(),
  })
  .superRefine((input, ctx) => {
    if (input.password !== input.repeatPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['repeatPassword'],
        message: userErrorMessages.repeatPassword,
      });
    }
  });

export const Register = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData>(initialUserData);
  const [loading, setLoading] = useState(false);
  const { error, validateInput, validatedInput } = useError({
    data: userData,
    errorMessages: userErrorMessages,
    inputParser: userInputParser,
  });

  const handleRegistration = async (event: FormEvent, userData: UserData) => {
    event.preventDefault();
    try {
      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { repeatPassword, ...data } = userData;
      await axios.post(`${import.meta.env.VITE_AUTH_URL}${routes.register.route}`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      enqueueSnackbar('User successfully registered', { variant: 'success', autoHideDuration: 3000 });
      navigate(routes.login.route);
    } catch (error: unknown) {
      handleError(error, enqueueSnackbar);
    }
    setLoading(false);
  };

  return (
    <PageContainer>
      <PaperCard maxWidth="500px" maxHeight="unset" marginBottom="50px" background="#efefef" cardProps={{ padding: '50px' }}>
        <PageHeader title="Register" textAlign="center" typographyProps={{ width: '100%' }} />
        <UserForm
          fullWidth
          userData={userData}
          setUserData={setUserData}
          error={error}
          validateInput={validateInput}
          validatedInput={validatedInput}
          onSubmit={handleRegistration}
          buttonGroupProps={{ confirmButtonText: 'Register' }}
        />
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
      </PaperCard>
      <LoadingOverlay open={loading} />
    </PageContainer>
  );
};
