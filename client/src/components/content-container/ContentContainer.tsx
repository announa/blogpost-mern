import { Box } from '@mui/material';
import { ReactNode } from 'react';

export interface ContentContainer {
  children: ReactNode;
}
export const ContentContainer = ({ children }: ContentContainer) => {
  return <Box marginTop="100px">{children}</Box>;
};
