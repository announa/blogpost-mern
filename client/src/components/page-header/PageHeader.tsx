import { Typography } from '@mui/material';
import { PaperBackground } from '../paper-background/PaperBackground';

export interface PageHeaderProps {
  title: string;
}

export const PageHeader = (props: PageHeaderProps) => {
  const { title } = props;

  return (
    <PaperBackground padding="24px 50px" width="100%">
      <Typography component="h1" variant="h5" borderRadius="50px" textAlign="left">
        {title}
      </Typography>
    </PaperBackground>
  );
};
