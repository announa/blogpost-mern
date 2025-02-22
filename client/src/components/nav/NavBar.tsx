import AccountCircleOutlinedIcon from '@mui/icons-material/Person';
import { Box, Menu, MenuItem, styled } from '@mui/material';
import { MouseEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo_new_transp.png';
import { routes } from '../../config/navigation/navigation';
import { useUserContext } from '../../context/useUserContext';
import { useLogout } from '../../hooks/useLogout';
import { Button } from '../base/button/Button';
import { Link } from '../base/link/Link';
import { LoadingOverlay } from '../base/loading-overlay/LoadingOverlay';

const Logo = styled('img')(({ theme }) => ({
  '&:hover': {
    filter: `drop-shadow(2px 2px 2px ${theme.palette.primary.shadow})`,
  },
  transition: 'filter 250ms cubic-bezier(0.4, 0, 0.2, 1)',
}));
export const NavBar = () => {
  const navigate = useNavigate();
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
      padding="0 65px 0 50px"
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
      {!userContext?.user ? (
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
            {userContext.user.firstName}
          </Button>
          <Menu open={isMenuOpen} anchorEl={menuAnchor} onClose={() => setMenuAnchor(null)}>
            <MenuItem onClick={handleAccountSettingsClick}> Account Settings</MenuItem>
            <MenuItem onClick={handleLogout}> Logout</MenuItem>
          </Menu>
        </Box>
      )}
      <LoadingOverlay open={loading} />
    </Box>
  );
};
