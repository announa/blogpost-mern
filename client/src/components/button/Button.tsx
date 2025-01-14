import { Button as MuiButton, ButtonProps } from '@mui/material';

export const Button = (props: ButtonProps) => {
  console.log(props);
  return (
    <MuiButton {...props} variant="contained" sx={{ '&:focus': { outline: 'none' } }}>
      {props.children}
    </MuiButton>
  );
};
