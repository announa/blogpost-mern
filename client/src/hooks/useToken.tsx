import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useUserContext } from '../context/useUserContext';
import { handleError } from '../utils/errorHandling';

export type StorageToken = {
  token: string;
  expiration: number;
};

export type TokenType = 'accessToken' | 'refreshToken';

export const useToken = () => {
  const userContext = useUserContext();
  const { enqueueSnackbar } = useSnackbar();

  const removeStorageData = (type?: TokenType) => {
    if (type) {
      localStorage.removeItem(type);
    } else {
      localStorage.clear();
    }
  };

  const getTokenFromLocalStorage = (type: TokenType) => {
    try {
      const storageToken = localStorage.getItem(type);
      if (!storageToken) {
        return null;
      }
      const token = JSON.parse(storageToken);
      const expiration = token?.expiration;
      const now = Date.now();
      if (expiration > now) {
        return token.token;
      } else {
        console.log(`${type} has expired`);
        removeStorageData(type);
        return null;
      }
    } catch {
      return null;
    }
  };

  const getAccessToken = async () => {
    let accessToken = getTokenFromLocalStorage('accessToken');
    if (!accessToken) {
      accessToken = await requestAccessToken();
    }
    return accessToken;
  };

  const requestAccessToken = async () => {
    try {
      const refreshToken = getTokenFromLocalStorage('refreshToken');
      if (!refreshToken) {
        userContext?.setUser(null);
        return null;
      }
      const result = await axios.post<{ accessToken: StorageToken }>(
        `${import.meta.env.VITE_AUTH_URL}/token`,
        {
          token: refreshToken,
        }
      );
      const accessToken = result.data.accessToken;
      if (!accessToken) {
        throw Error();
      }
      localStorage.setItem('accessToken', JSON.stringify(accessToken));
      return accessToken.token;
    } catch (error) {
      handleError(error, enqueueSnackbar);
      return null;
    }
  };

  return { getAccessToken, getTokenFromLocalStorage };
};
