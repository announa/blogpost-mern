import AccountCircleOutlinedIcon from '@mui/icons-material/Person';
import { Box, Divider, Menu, MenuItem, styled } from '@mui/material';
import { MouseEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo_new_transp.png';
import { routes } from '../../config/navigation/navigation';
import { useAuthContext } from '../../context/useAuthContext';
import { Button } from '../base/button/Button';
import { Link } from '../base/link/Link';
import { LoadingOverlay } from '../base/loading-overlay/LoadingOverlay';

const Logo = styled('img')(({ theme }) => ({
  '&:hover': {
    filter: `drop-shadow(2px 2px 2px ${theme.palette.primary.shadow})`,
  },
  transition: 'filter 250ms cubic-bezier(0.4, 0, 0.2, 1)',
}));

const AccountMenuItem = styled(MenuItem)({
  fontSize: '14px',
});

export const NavBar = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const { logout, loading } = useAuthContext();

  const handleLogout = async () => {
    setMenuAnchor(null);
    await logout();
  };
  const isMenuOpen = useMemo(() => !!menuAnchor, [menuAnchor]);

  const handleAccountSettingsClick = () => {
    navigate(routes.account.route);
    setMenuAnchor(null);
  };

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
      padding="0 50px 0 50px"
      zIndex={2}
      sx={{ background: 'white' }}
    >
      <Box display="flex" alignItems="center" gap="32px">
        <Link to={routes.posts.route}>
          <Box width="100%" height="100%" display="flex" alignItems="center" justifyContent="center">
            <Logo height={30} src={logo} />
          </Box>
        </Link>
        <Link to={routes.addPost.route} color="black">
          <Button variant="outlined">{routes.addPost.name}</Button>
        </Link>
      </Box>
      {!user ? (
        <Box display="flex" gap="12px">
          <Link to={routes.login.route} color="black" fontSize="14px">
            <Button>{routes.login.name}</Button>
          </Link>
          <Link to={routes.register.route} color="black" fontSize="14px">
            <Button variant="outlined">{routes.register.name}</Button>
          </Link>
        </Box>
      ) : (
        <Box>
          <Button
            startIcon={<AccountCircleOutlinedIcon />}
            variant="contained"
            aria-expanded={isMenuOpen ? 'true' : undefined}
            aria-controls={isMenuOpen ? 'basic-menu' : undefined}
            aria-haspopup="true"
            sx={{ borderRadius: '30px', svg: { fontSize: '24px !important' } }}
            onClick={(event: MouseEvent<HTMLButtonElement>) => setMenuAnchor(event.currentTarget)}
          >
            {user.firstName}
          </Button>
          <Menu
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={isMenuOpen}
            anchorEl={menuAnchor}
            onClose={() => setMenuAnchor(null)}
            sx={{ '& .Mui-disabled': { opacity: 1 } }}
          >
            <AccountMenuItem disabled sx={{ fontStyle: 'italic' }}>
              {' '}
              {user.firstName} {user.lastName}{' '}
            </AccountMenuItem>
            <AccountMenuItem disabled sx={{ fontStyle: 'italic' }}>
              {' '}
              {user.userName}{' '}
            </AccountMenuItem>
            <Divider />
            <AccountMenuItem onClick={handleAccountSettingsClick}> Account Settings</AccountMenuItem>
            <AccountMenuItem onClick={handleLogout}> Logout</AccountMenuItem>
          </Menu>
        </Box>
      )}
      <LoadingOverlay open={loading} />
    </Box>
  );
};
