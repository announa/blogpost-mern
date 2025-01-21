import { Typography, TypographyProps } from '@mui/material';

export interface PageHeaderProps extends TypographyProps {
  title: string;
}

export const PageHeader = ({ title, ...props }: PageHeaderProps) => {
  return (
    <Typography component="h1" variant="h5" marginBottom="40px" {...props}>
      {title}
    </Typography>
  );
};
