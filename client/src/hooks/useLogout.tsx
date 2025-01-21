import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { routes } from '../config/navigation/navigation';
import { useUserContext } from '../context/useUserContext';
import { handleError } from '../utils/errorHandling';
import { useToken } from './useToken';

export const useLogout = () => {
  const navigate = useNavigate();
  const userContext = useUserContext();
  const { getAccessToken } = useToken();

  const removeStorageData = () => {
    localStorage.clear();
  };

  const logout = async (customAction?: () => void) => {
    try {
      const accessToken = await getAccessToken();
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
      if (userContext) {
        userContext.setUser(null);
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
