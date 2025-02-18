import { Box, BoxProps } from '@mui/material';

export const PageContainer = ({ children, ...props }: BoxProps) => {
  return (
    <Box
      width="100%"
      display="flex"
      alignItems="center"
      flexDirection="column"
      overflow="auto"
      padding="120px 50px 0"
      {...props}
    >
      {children}
    </Box>
  );
};
