import { Paper, PaperProps, styled } from '@mui/material';

export type PaperBackgroundProps = PaperProps & {
  width?: string;
  height?: string;
  minHeight?: string;
  padding?: string;
  flex?: number;
};

export const PaperBackground = styled(Paper)<PaperBackgroundProps>(
  ({ width, padding, height, minHeight, flex }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: padding ?? '50px',
    width: width ?? '100%',
    height: height ?? 'unset',
    // background: '#f5f5f5',
    minHeight: minHeight ?? 'unset',
    overflowY: 'auto',
    flex: flex ?? 'unset',
  })
);
