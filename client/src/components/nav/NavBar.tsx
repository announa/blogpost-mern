import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { Box, Menu, MenuItem } from '@mui/material';
import { MouseEvent, useMemo, useState } from 'react';
import { routes, sidebarRoutes } from '../../config/navigation/navigation';
import { useUserContext } from '../../context/useUserContext';
import { useLogout } from '../../hooks/useLogout';
import { Button } from '../base/button/Button';
import { Link } from '../base/link/Link';
import { LoadingOverlay } from '../base/loading-overlay/LoadingOverlay';

export const NavBar = () => {
  const userContext = useUserContext();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const { logout } = useLogout();

  const handleLogout = async () => {
    setLoading(true);
    setMenuAnchor(null);
    await logout(() => setLoading(false));
  };
  const isMenuOpen = useMemo(() => !!menuAnchor, [menuAnchor]);
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
      padding="0 50px"
      zIndex={2}
      sx={{background: 'white'}}
    >
      <Box display="flex" gap="24px">
        {sidebarRoutes.flatMap((route) =>
          route.route === routes.addPost.route && !userContext?.user ? (
            []
          ) : (
            <Link key={route.route} to={route.route} color="black">
              {route.name}
            </Link>
          )
        )}
      </Box>
      {!userContext?.user ? (
        <Box>
          <Link to={routes.login.route} color="black" fontSize="14px">
            {routes.login.name}
          </Link>{' '}
          |{' '}
          <Link to={routes.register.route} color="black" fontSize="14px">
            {routes.register.name}
          </Link>
        </Box>
      ) : (
        <Box>
          <Button
            startIcon={<AccountCircleOutlinedIcon />}
            variant="outlined"
            aria-expanded={isMenuOpen ? 'true' : undefined}
            aria-controls={isMenuOpen ? 'basic-menu' : undefined}
            aria-haspopup="true"
            onClick={(event: MouseEvent<HTMLButtonElement>) => setMenuAnchor(event.currentTarget)}
          >
            {userContext.user.firstName}
          </Button>
          <Menu open={isMenuOpen} anchorEl={menuAnchor} onClose={() => setMenuAnchor(null)}>
            <MenuItem> Account Settings</MenuItem>
            <MenuItem onClick={handleLogout}> Logout</MenuItem>
          </Menu>
        </Box>
      )}
      <LoadingOverlay open={loading} />
    </Box>
  );
};
