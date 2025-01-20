import { Box, BoxProps } from '@mui/material';
import { ReactNode } from 'react';

export interface ContentContainerProps extends BoxProps {
  children?: ReactNode;
}
export const PageContainer = ({ children, ...props }: ContentContainerProps) => {
  return (
    <Box width="100%" display="flex" alignItems="center" flexDirection="column" marginTop="80px" {...props}>
      {children}
    </Box>
  );
};
