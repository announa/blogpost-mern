import { Box, TextField, Typography } from '@mui/material';
import { FormEvent, useMemo, useState } from 'react';
import validator from 'validator';
import { z } from 'zod';
import { ErrorMessage } from '../../components/base/error-message/ErrorMessage';
import { FormContainer } from '../../components/base/form-container/FormContainer';
import { PaperCard } from '../../components/base/paper-card/PaperCard';
import { ButtonGroup } from '../../components/button-group/ButtonGroup';
import { PageContainer } from '../../components/page/page-container/PageContainer';
import { PageHeader } from '../../components/page/page-header/PageHeader';
import { routes } from '../../config/navigation/navigation';
import { useError } from '../../hooks/useError';
import axios from 'axios';
import { handleError } from '../../utils/errorHandling';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { LoadingOverlay } from '../../components/base/loading-overlay/LoadingOverlay';

const forgotPasswordParser = z.object({
  email: z.string().refine((value) => validator.isEmail(value)),
});

const errorMessages = { email: 'A valid email address is required' };

export const ForgotPassword = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [data, setData] = useState({ email: '' });
  const [loading, setLoading] = useState(false);
  const { error, validateInput, validatedInput } = useError({
    data: data,
    errorMessages,
    inputParser: forgotPasswordParser,
  });
  const isSubmitDisabled = useMemo(() => !validatedInput.success, [validatedInput]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_AUTH_URL}/request-reset-password`, data);
      enqueueSnackbar('Email successfully sent', { variant: 'success' });
      navigate(routes.login.route);
    } catch (error) {
      handleError(error, enqueueSnackbar);
    }
    setLoading(false);
  };
  return (
    <PageContainer>
      <PaperCard maxWidth="500px" maxHeight="unset" marginBottom="50px">
        <Box>
          <PageHeader title="Forgot Password" textAlign="center" marginBottom="24px" />
          <Typography variant="body2">
            Please enter your registered email address. A link for resetting your password will be sent to
            this email address.
          </Typography>
        </Box>
        <FormContainer onSubmit={handleSubmit}>
          <TextField
            name="email"
            label="E-Mail"
            type="email"
            required
            fullWidth
            onBlur={() => validateInput('email')}
            value={data.email}
            onChange={(event) => setData({ email: event.target.value })}
            error={!!error.email}
          />
          {error.email && <ErrorMessage>{error.email}</ErrorMessage>}
          <ButtonGroup
            submitButtonText="Send"
            isSubmitDisabled={isSubmitDisabled}
            cancelRedirectUrl={routes.login.route}
          />
        </FormContainer>
      </PaperCard>
      <LoadingOverlay open={loading} />
    </PageContainer>
  );
};
