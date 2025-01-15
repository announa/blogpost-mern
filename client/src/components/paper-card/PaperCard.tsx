import { Card, CardProps, styled } from '@mui/material';

type PaperCardProps = CardProps & {
  width?: string;
  maxWidth?: string;
  height?: string;
  aspectRatio?: string;
  center?: boolean;
};

export const PaperCard = styled(Card)<PaperCardProps>(({ width, maxWidth, height, aspectRatio, center }) => ({
  width: width ?? '100%',
  maxWidth: maxWidth ?? 'unset',
  height: height ?? 'unset',
  aspectRatio: aspectRatio ?? 'unset',
  display: 'flex',
  alignItems: center ? 'center' : 'unset',
  justifyContent: center ? 'center' : 'unset',
  flexDirection: 'column',
  gap: '24px',
  borderRadius: '20px',
  padding: '18px',
  background: 'white'
}));
