import { Box, BoxProps, styled, Typography, TypographyProps } from '@mui/material';

const StyledBox = styled(Box)({
  top: '130px',
  right: 0,
  width: '100%',
});

export interface PageHeaderProps extends BoxProps {
  title: string;
  customElement?: JSX.Element;
  typographyProps?: TypographyProps;
}

export const PageHeader = ({ title, customElement, typographyProps, ...props }: PageHeaderProps) => {
  return (
    <StyledBox
      marginBottom="40px"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      {...props}
    >
      <Typography component="h1" variant="h5" {...typographyProps}>
        {title}
      </Typography>
      {customElement}
    </StyledBox>
  );
};
