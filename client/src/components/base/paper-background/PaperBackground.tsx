import { Paper, PaperProps, styled } from '@mui/material';

export type PaperBackgroundProps = PaperProps & {
  width?: string;
  minHeight?: string;
  padding?: string;
  flex?: number;
};

export const PaperBackground = styled(Paper)<PaperBackgroundProps>(
  ({ width, padding, minHeight, flex }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: padding ?? '50px',
    width: width ?? '100%',
    height: '100%',
    // background: '#f5f5f5',
    minHeight: minHeight ?? 'unset',
    // overflowY: 'auto',
    flex: flex ?? 'unset',
  })
);
