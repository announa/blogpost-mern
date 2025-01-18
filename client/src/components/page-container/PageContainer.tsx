import { styled } from '@mui/material';

const Container = styled('div')({
  height: '100%',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '36px',
  position: 'relative'
});

export interface PageContainerProps {
  children: React.ReactNode;
}

export const PageContainer = (props: PageContainerProps) => {
  const { children } = props;

  return <Container>{children}</Container>;
};
