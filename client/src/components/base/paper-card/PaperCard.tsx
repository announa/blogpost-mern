import { Box, BoxProps, Card, CardProps, styled } from '@mui/material';
import { ReactNode } from 'react';

export const StyledCard = styled(Card)<{ padding?: string }>(({ padding }) => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  gap: '24px',
  padding: padding ?? '50px',
  height: '100%',
  position: 'relative',
}));

export interface PaperCardProps extends BoxProps {
  cardProps?: CardProps & { padding?: string };
  children?: ReactNode;
}
export const PaperCard = ({ cardProps, children, ...boxProps }: PaperCardProps) => {
  return (
    <Box borderRadius="4px" width="100%" maxHeight="100%" {...boxProps}>
      <StyledCard {...cardProps}>{children}</StyledCard>
    </Box>
  );
};
