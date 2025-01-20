import { Box, Typography } from '@mui/material';
import { ContentContainerProps, PageContainer } from '../../components/page-container/PageContainer';
import { PageHeader } from '../../components/page-header/PageHeader';

export interface NoDataProps extends ContentContainerProps {
  title: string;
}
export const NoData = ({ title, ...props }: NoDataProps) => {
  return (
    <PageContainer flex={1} justifyContent="center" {...props}>
      <PageHeader title={title} />
      <Box display="flex" alignItems="center" height="100%">
        <Typography variant="h6">Data not available</Typography>
      </Box>
    </PageContainer>
  );
};
