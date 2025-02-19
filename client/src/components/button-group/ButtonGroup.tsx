import { Box, BoxProps } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Button } from '../base/button/Button';

export interface ButtonGroupProps extends BoxProps {
  cancelRedirectUrl?: string;
  isConfirmDisabled?: boolean;
  confirmButtonText: string;
  onCancel?: () => void;
  onConfirm?: () => void;
}
export const ButtonGroup = (props: ButtonGroupProps) => {
  const {
    confirmButtonText: submitButtonText,
    cancelRedirectUrl,
    isConfirmDisabled: isSubmitDisabled,
    onCancel,
    onConfirm,
    ...boxProps
  } = props;
  const navigate = useNavigate();
  return (
    <Box display="flex" justifyContent="space-between" gap="24px" marginTop="18px" {...boxProps}>
      {(cancelRedirectUrl || onCancel) && (
        <Button
          variant="outlined"
          onClick={() => {
            if (onCancel) {
              onCancel();
            }
            if (cancelRedirectUrl) {
              navigate(cancelRedirectUrl);
            }
          }}
        >
          Cancel
        </Button>
      )}
      <Button
        sx={{ width: !(cancelRedirectUrl || onCancel) ? '100%' : 'unset', borderRadius: '30px' }}
        type={onConfirm ? 'button' : 'submit'}
        disabled={isSubmitDisabled}
      >
        {submitButtonText}
      </Button>
    </Box>
  );
};
