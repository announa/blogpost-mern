import { Box } from '@mui/material';
import { routes, sidebarRoutes } from '../../config/navigation/navigation';
import { Link } from '../link/Link';

export const NavBar = () => {
  return (
    <Box
      position="absolute"
      top={0}
      right={0}
      width="100%"
      height="100px"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      padding='0 50px'
    >
      <Box display="flex" gap="24px">
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
    </Box>
  );
};
