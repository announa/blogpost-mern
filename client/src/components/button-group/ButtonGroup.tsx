import { Box, BoxProps } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Button } from '../base/button/Button';

export interface ButtonGroupProps extends BoxProps {
  cancelRedirectUrl?: string;
  isSubmitDisabled?: boolean;
  submitButtonText: string;
  onCancelAction?: () => void;
}
export const ButtonGroup = (props: ButtonGroupProps) => {
  const { submitButtonText, cancelRedirectUrl, isSubmitDisabled, onCancelAction, ...boxProps } = props;
  const navigate = useNavigate();
  return (
    <Box display="flex" justifyContent="space-between" gap="24px" marginTop="18px" {...boxProps}>
      {(cancelRedirectUrl || onCancelAction) && (
        <Button
          variant="outlined"
          onClick={() => {
            if (onCancelAction) {
              onCancelAction();
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
        sx={{ width: !(cancelRedirectUrl || onCancelAction) ? '100%' : 'unset' }}
        type="submit"
        disabled={isSubmitDisabled}
      >
        {submitButtonText}
      </Button>
    </Box>
  );
};
