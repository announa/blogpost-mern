import { Box } from '@mui/material';
import { ReactNode } from 'react';

export interface ContentContainer {
  children: ReactNode;
}
export const ContentContainer = ({ children }: ContentContainer) => {
  return (
    <Box width="100%" display="flex" alignItems="center" flexDirection="column" marginTop="100px">
      {children}
    </Box>
  );
};
