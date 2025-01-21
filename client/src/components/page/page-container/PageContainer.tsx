import { Box, BoxProps } from '@mui/material';

export const PageContainer = ({ children, ...props }: BoxProps) => {
  return (
    <Box
      width="100%"
      display="flex"
      alignItems="center"
      flexDirection="column"
      marginTop="80px"
      overflow="auto"
      {...props}
    >
      {children}
    </Box>
  );
};
