import { Box, BoxProps, CircularProgress, Typography } from '@mui/material';
import { PageContainer } from '../../components/page/page-container/PageContainer';
import { PageHeader } from '../../components/page/page-header/PageHeader';

export interface LoadingProps extends BoxProps {
  title: string;
}

export const Loading = ({ title, ...props }: LoadingProps) => {
  return (
    <PageContainer flex={1} justifyContent="center" {...props}>
      <PageHeader width="100%" title={title} />
      <Box display="flex" alignItems="center" height="100%">
        <Typography variant="h6">
          <CircularProgress />
        </Typography>
      </Box>
    </PageContainer>
  );
};
