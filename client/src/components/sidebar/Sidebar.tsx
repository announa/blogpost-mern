import { Box, Paper, styled } from '@mui/material';
import { routes, sidebarRoutes } from '../../config/navigation/navigation';
import { Link } from '../base/link/Link';

const SidebarContainer = styled(Paper)({
  width: '25vw',
  maxWidth: '250px',
  height: '100%',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  // gap: '36px',
  padding: '50px',
});

export const Sidebar = () => {
  return (
    <SidebarContainer>
      <Box display="flex" flexDirection="column" gap="36px">
        {sidebarRoutes.map((route) => (
          <Link key={route.route} to={route.route} color="black">
            {route.name}
          </Link>
        ))}
      </Box>
      <Box>
        <Link to={routes.login.route} color="black" fontSize="14px">
          {routes.login.name}
        </Link>{' '}
        |{' '}
        <Link to={routes.register.route} color="black" fontSize="14px">
          {routes.register.name}
        </Link>
      </Box>
    </SidebarContainer>
  );
};
