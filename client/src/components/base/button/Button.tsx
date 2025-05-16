import { Button as MuiButton, ButtonProps } from '@mui/material';

export const Button = (props: ButtonProps) => {
  return (
    <MuiButton variant="contained" sx={{ '&:focus': { outline: 'none' }, borderRadius: '30px', background: 'white' }} {...props}>
      {props.children}
    </MuiButton>
  );
};
