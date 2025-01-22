import { Box, Typography, TypographyProps } from '@mui/material';

export interface PageHeaderProps extends TypographyProps {
  title: string;
  customElement?: JSX.Element
}

export const PageHeader = ({ title, customElement, ...props }: PageHeaderProps) => {
  return (
    <Box marginBottom="40px" display='flex' justifyContent='space-between' alignItems='center'>
    <Typography component="h1" variant="h5"  {...props}>
      {title}
    </Typography>
    {customElement}
    </Box>
  );
};
