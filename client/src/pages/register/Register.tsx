import { Typography, useTheme } from '@mui/material';
import { FormEvent, useState } from 'react';
import validator from 'validator';
import { z } from 'zod';
import { Link } from '../../components/base/link/Link';
import { LoadingOverlay } from '../../components/base/loading-overlay/LoadingOverlay';
import { PaperCard } from '../../components/base/paper-card/PaperCard';
import { PageContainer } from '../../components/page/page-container/PageContainer';
import { PageHeader } from '../../components/page/page-header/PageHeader';
import { routes } from '../../config/navigation/navigation';
import { useAuthContext } from '../../context/useAuthContext';
import { useError } from '../../hooks/useError';
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

export type RegisterUserData = Omit<UserData, 'repeatPassword'>;

export const Register = () => {
  const theme = useTheme();
  const { registerUser, loading } = useAuthContext();
  const [userData, setUserData] = useState<UserData>(initialUserData);
  const { error, validateInput, validatedInput } = useError({
    data: userData,
    errorMessages: userErrorMessages,
    inputParser: userInputParser,
  });

  const handleRegistration = async (event: FormEvent, userData: UserData) => {
    event.preventDefault();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { repeatPassword, ...data } = userData;
    await registerUser(userData);
  };

  return (
    <PageContainer>
      <PaperCard
        maxWidth="500px"
        maxHeight="unset"
        marginBottom="50px"
        background="#efefef"
        cardProps={{ padding: '50px' }}
      >
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
