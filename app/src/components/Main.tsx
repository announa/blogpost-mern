import { styled } from '@mui/material';
import { Dashboard } from './dashboard/Dashboard';

const Background = styled('div')({
  height: '100vh',
  width: '100vw',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});
export const Main = () => {
  return (
    <Background>
      <Dashboard />
    </Background>
  );
};
