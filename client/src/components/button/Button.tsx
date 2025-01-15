import { Button as MuiButton, ButtonProps } from '@mui/material';

export const Button = (props: ButtonProps) => {
  console.log(props);
  return (
    <MuiButton variant="contained" sx={{ '&:focus': { outline: 'none' } }} {...props}>
      {props.children}
    </MuiButton>
  );
};
