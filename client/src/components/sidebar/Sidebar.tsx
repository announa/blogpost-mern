import { Link, Paper, styled } from '@mui/material';
import { sidebarRoutes } from '../../config/navigation/navigation';

const SidebarContainer = styled(Paper)({
  width: '25vw',
  maxWidth: '250px',
  height: '100%',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '36px',
  padding: '50px',
});

export const Sidebar = () => {
  return (
    <SidebarContainer>
      {sidebarRoutes.map((route) => (
        <Link href={route.route} underline='none' color='black'>{route.name}</Link>
      ))}
    </SidebarContainer>
  );
};
