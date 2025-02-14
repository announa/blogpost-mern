import { Box, BoxProps, styled, Typography, TypographyProps } from '@mui/material';

const StyledBox = styled(Box)<{fullWidth: boolean}>(({ theme, fullWidth }) => ({
  top: '130px',
  right: 0,
  [theme.breakpoints.up('md')]: {
    width: fullWidth ? '100%' : '75%',
  },
}));

export interface PageHeaderProps extends BoxProps {
  title: string;
  customElement?: JSX.Element;
  fullWidth?: boolean;
  typographyProps?: TypographyProps;
}

export const PageHeader = ({ title, customElement, fullWidth=false, typographyProps, ...props }: PageHeaderProps) => {
  return (
    <StyledBox
      marginBottom="40px"
      // width="100%"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      // padding='0 112px 0 100px'
      fullWidth={fullWidth}
      {...props}
    >
      <Typography component="h1" variant="h5" {...typographyProps}>
        {title}
      </Typography>
      {customElement}
    </StyledBox>
  );
};
