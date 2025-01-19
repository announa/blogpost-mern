import { styled } from '@mui/material';

const Container = styled('div')({
  height: '100vh',
  width: '100vw',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '36px',
  position: 'relative',
  padding: '10px',
  backgroundColor: '#efefef',

});

export interface PageContainerProps {
  children: React.ReactNode;
}

export const PageContainer = (props: PageContainerProps) => {
  const { children } = props;

  return <Container>{children}</Container>;
};
