import { Box, BoxProps, Card, CardProps, styled } from '@mui/material';
import { ReactNode } from 'react';

export const StyledCard = styled(Card)<{ padding?: string; background?: string }>(
  ({ padding, background }) => ({
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    gap: '24px',
    padding: padding ?? 'unset',
    height: '100%',
    position: 'relative',
    background: background ?? 'white',
  })
);

export interface PaperCardProps extends BoxProps {  
  cardProps?: CardProps & { padding?: string };
  children?: ReactNode;
  background?: string;
}
export const PaperCard = ({ cardProps, children, background, ...boxProps }: PaperCardProps) => {
  return (
    <Box borderRadius="4px" width="100%" maxHeight="100%" {...boxProps} padding="10px">
      <StyledCard padding='50px' {...cardProps} background={background}>
        {children}
      </StyledCard>
    </Box>
  );
};
