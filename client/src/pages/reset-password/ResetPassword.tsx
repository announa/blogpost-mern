import { TextField } from '@mui/material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { FormEvent, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { ErrorMessage } from '../../components/base/error-message/ErrorMessage';
import { FormContainer } from '../../components/base/form-container/FormContainer';
import { LoadingOverlay } from '../../components/base/loading-overlay/LoadingOverlay';
import { PaperCard } from '../../components/base/paper-card/PaperCard';
import { ButtonGroup } from '../../components/button-group/ButtonGroup';
import { PageContainer } from '../../components/page/page-container/PageContainer';
import { PageHeader } from '../../components/page/page-header/PageHeader';
import { routes } from '../../config/navigation/navigation';
import { useError } from '../../hooks/useError';
import { errorHasText, handleError } from '../../utils/errorHandling';
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
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [passwordData, setPasswordData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const { error, validateInput, validatedInput } = useError({
    data: passwordData,
    errorMessages,
    inputParser: resetPasswordParser,
  });
  const isSubmitDisabled = useMemo(() => !validatedInput.success, [validatedInput]);

  const handleResetPassword = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setLoading(true);
      await axios.put(`${import.meta.env.VITE_AUTH_URL}/reset-password`, {
        password: passwordData.password,
        token: token,
        userId: userId,
      });
      enqueueSnackbar('Successfully updated password', { variant: 'success' });
      navigate(routes.login.route);
    } catch (error: unknown) {
      if (
        errorHasText(error, [
          'The reset password token has expired',
          'No reset token found',
          'Invalid reset token',
        ])
      ) {
        handleError(error, enqueueSnackbar, 'The reset password link is invalid. Please request a new link');
      } else {
        handleError(error, enqueueSnackbar);
      }
    }
    setLoading(false);
  };

  return (
    <PageContainer>
      <PaperCard maxWidth="500px" maxHeight="unset" marginBottom="50px">
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
            error={!!error.repeatPassword}
          />
          {error.repeatPassword && <ErrorMessage>{error.repeatPassword}</ErrorMessage>}
          <ButtonGroup
            submitButtonText="Reset Password"
            isSubmitDisabled={isSubmitDisabled}
            cancelRedirectUrl={routes.login.route}
          />
        </FormContainer>
      </PaperCard>
      <LoadingOverlay open={loading} />
    </PageContainer>
  );
};
