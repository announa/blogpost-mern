import { Box, TextField, Typography } from '@mui/material';
import { FormEvent, useMemo, useState } from 'react';
import validator from 'validator';
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

const forgotPasswordParser = z.object({
  email: z.string().refine((value) => validator.isEmail(value)),
});

const errorMessages = { email: 'A valid email address is required' };

export const ForgotPassword = () => {
  const { forgotPassword, loading } = useAuthContext();
  const [data, setData] = useState({ email: '' });
  const { error, validateInput, validatedInput } = useError({
    data: data,
    errorMessages,
    inputParser: forgotPasswordParser,
  });
  const isSubmitDisabled = useMemo(() => !validatedInput.success, [validatedInput]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await forgotPassword(data);
  };

  return (
    <PageContainer>
      <PaperCard maxWidth="450px" background="#efefef" cardProps={{ padding: '50px' }}>
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
            slotProps={{ input: { sx: { background: 'white' } } }}
            error={!!error.email}
          />
          {error.email && <ErrorMessage>{error.email}</ErrorMessage>}
          <ButtonGroup
            confirmButtonText="Send"
            isConfirmDisabled={isSubmitDisabled}
            cancelRedirectUrl={routes.login.route}
          />
        </FormContainer>
      </PaperCard>
      <LoadingOverlay open={loading} />
    </PageContainer>
  );
};
