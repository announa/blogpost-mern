import { TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import { FormEvent, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import { ErrorMessage } from '../../components/base/error-message/ErrorMessage';
import { FormContainer } from '../../components/base/form-container/FormContainer';
import { LoadingOverlay } from '../../components/base/loading-overlay/LoadingOverlay';
import { PaperCard } from '../../components/base/paper-card/PaperCard';
import { ButtonGroup } from '../../components/button-group/ButtonGroup';
import { PageContainer } from '../../components/page/page-container/PageContainer';
import { PageHeader } from '../../components/page/page-header/PageHeader';
import { routes } from '../../config/navigation/navigation';
import { useAuthContext } from '../../context/useAuthContext';
import { useError } from '../../hooks/useError';
import { errorContainsStrings, handleError } from '../../utils/errorHandling';
import { PASSWORD_REGEX, userErrorMessages } from '../account-settings/form/utils';

const resetPasswordParser = z
  .object({
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

const initialData = {
  password: '',
  repeatPassword: '',
};

const errorMessages = {
  password: userErrorMessages.password,
  repeatPassword: userErrorMessages.repeatPassword,
};

export const ResetPassword = () => {
  const { token, id: userId } = useParams();
  const { resetPassword, loading } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [passwordData, setPasswordData] = useState(initialData);
  const { error, validateInput, validatedInput } = useError({
    data: passwordData,
    errorMessages,
    inputParser: resetPasswordParser,
  });
  const isSubmitDisabled = useMemo(() => !validatedInput.success, [validatedInput]);

  const handleResetPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || !passwordData.password || !userId) {
      return;
    }

    resetPassword({
      password: passwordData.password,
      token,
      userId,
      onError: () => {
        if (
          errorContainsStrings(error, [
            'The reset password token has expired',
            'No reset token found',
            'Invalid reset token',
          ])
        ) {
          handleError(
            error,
            enqueueSnackbar,
            'The reset password link is invalid. Please request a new link'
          );
        } else {
          handleError(error, enqueueSnackbar);
        }
      },
    });
  };

  return (
    <PageContainer>
      <PaperCard maxWidth="450px" background="#efefef" cardProps={{ padding: '50px' }}>
      <PageHeader title="Reset Password" />
        <FormContainer onSubmit={handleResetPassword}>
          <TextField
            name="password"
            label="Password"
            type="password"
            required
            fullWidth
            onBlur={() => validateInput('password')}
            value={passwordData.password}
            onChange={(event) => setPasswordData({ ...passwordData, password: event.target.value })}
            slotProps={{ input: { sx: { background: 'white' } } }}
            error={!!error.password}
          />
          {error.password && <ErrorMessage>{error.password}</ErrorMessage>}
          <TextField
            name="repeatPassword"
            label="Repeat password"
            type="password"
            required
            fullWidth
            onBlur={() => validateInput('repeatPassword')}
            value={passwordData.repeatPassword}
            onChange={(event) => setPasswordData({ ...passwordData, repeatPassword: event.target.value })}
            slotProps={{ input: { sx: { background: 'white' } } }}
            error={!!error.repeatPassword}
          />
          {error.repeatPassword && <ErrorMessage>{error.repeatPassword}</ErrorMessage>}
          <ButtonGroup
            confirmButtonText="Reset Password"
            isConfirmDisabled={isSubmitDisabled}
            cancelRedirectUrl={routes.login.route}
          />
        </FormContainer>
      </PaperCard>
      <LoadingOverlay open={loading} />
    </PageContainer>
  );
};
