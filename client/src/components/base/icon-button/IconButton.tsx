import { IconButtonProps, IconButton as MuiButton } from '@mui/material';
import { theme } from '../../../style/theme';

export const IconButton = (props: IconButtonProps) => {
  return (
    <MuiButton
      sx={{ '&:focus': { outline: 'none' } }}
      {...props}
    >
      {props.children}
    </MuiButton>
  );
};
