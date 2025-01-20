import { Typography, TypographyProps } from '@mui/material';

export interface PageHeaderProps extends TypographyProps {
  title: string;
}

export const PageHeader = ({ title, ...props }: PageHeaderProps) => {
  return (
    // <PaperBackground padding="24px 50px" width="100%">
    <Typography component="h1" variant="h5" marginBottom="24px" {...props}>
      {title}
    </Typography>
    // </PaperBackground>
  );
};
