import { IconButtonProps, IconButton as MuiButton } from '@mui/material';

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
