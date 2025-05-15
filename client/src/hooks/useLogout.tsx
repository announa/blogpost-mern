import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { routes } from '../config/navigation/navigation';
import { handleError } from '../utils/errorHandling';
import { useAuthContext } from '../context/useAuthContext';

export const useLogout = () => {
  const navigate = useNavigate();
  const { user, setUser, accessToken } = useAuthContext();

  const removeStorageData = () => {
    localStorage.clear();
  };

  const logout = async (customAction?: () => void) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_AUTH_URL}/logout`,
        {},
        {
          headers: {
            ['Authorization']: `Bearer ${accessToken}`,
          },
        }
      );
      removeStorageData();
      if (customAction) {
        customAction();
      }
      if (user) {
        setUser(null);
      }
      navigate(routes.login.route);
    } catch (error) {
      if (customAction) {
        customAction();
      }
      handleError(error, enqueueSnackbar);
    }
  };

  return { logout };
};
