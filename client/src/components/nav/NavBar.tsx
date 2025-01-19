import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { Box, Menu, MenuItem, styled } from '@mui/material';
import { MouseEvent, useMemo, useState } from 'react';
import { routes, sidebarRoutes } from '../../config/navigation/navigation';
import { useUserContext } from '../../context/UserContext';
import { Button } from '../button/Button';
import { Link } from '../link/Link';
import { useLogout } from '../../hooks/useLogout';

const NavBarMenuItem = styled(MenuItem)({
  paddingTop: 0,
  paddingBottom: 0,
  minHeight: '40px',
});
export const NavBar = () => {
  const userContext = useUserContext();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const { logout } = useLogout();

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
    >
      <Box display="flex" gap="24px">
        {sidebarRoutes.map((route) => (
          <Link key={route.route} to={route.route} color="black">
            {route.name}
          </Link>
        ))}
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
            <NavBarMenuItem> Account Settings</NavBarMenuItem>
            <NavBarMenuItem onClick={async () => await logout()}> Logout</NavBarMenuItem>
          </Menu>
        </Box>
      )}
    </Box>
  );
};
