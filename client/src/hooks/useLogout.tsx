import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { routes } from '../config/navigation/navigation';
import { handleError } from '../utils/errorHandling';
import { getAccessToken } from '../utils/getToken';
import { useUserContext } from '../context/UserContext';

export const useLogout = () => {
  const navigate = useNavigate();
  const userContext = useUserContext();

  const removeStorageData = () => {
    localStorage.clear();
  };

  const logout = async (customAction?: () => void) => {
    try {
      const accessToken = await getAccessToken(enqueueSnackbar);
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
