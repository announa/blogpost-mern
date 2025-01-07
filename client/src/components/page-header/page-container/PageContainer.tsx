import { styled } from '@mui/material';

const Container = styled('div')({
  height: '100vh',
  width: '100vw',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '36px',
  padding: '50px'
});

export interface PageContainerProps {
  children: React.ReactNode;
}

export const PageContainer = (props: PageContainerProps) => {
  const { children } = props;

  return <Container>{children}</Container>;
};
