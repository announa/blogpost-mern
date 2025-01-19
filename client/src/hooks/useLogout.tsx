import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { routes } from '../config/navigation/navigation';
import { handleError } from '../utils/errorHandling';
import { getAccessToken } from '../utils/getToken';

export const useLogout = () => {
  const navigate = useNavigate();

  const removeStorageData = () => {
    localStorage.clear();
  };

  const logout = async () => {
    try {
      const accessToken = getAccessToken(enqueueSnackbar);
      await axios.post(`${import.meta.env.VITE_AUTH_URL}/logout`, {
        headers: {
          ['Authorization']: accessToken,
        },
      });
      removeStorageData();
      navigate(routes.login.route);
    } catch (error) {
      handleError(error, enqueueSnackbar);
    }
  };

  return { logout };
};
