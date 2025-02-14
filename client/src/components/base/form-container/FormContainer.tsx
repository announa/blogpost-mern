import { styled } from '@mui/material';

export const FormContainer = styled('form')<{ maxWidth?: string }>(({ theme, maxWidth }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  width: '100%',
  maxWidth: maxWidth ?? 'unset',
}));
