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

  const getStorageItem = (type: TokenType) => {
    try {
      const storageItem = localStorage.getItem(type);
      if (!storageItem) {
        return null;
      }
      const token: StorageToken = JSON.parse(storageItem);
      return token
  } catch {
    return null
  }
}

  const getTokenFromLocalStorage = (type: TokenType): string | null => {
    try {
      const storageToken = getStorageItem(type)
      const expiration = storageToken?.expiration;
      const now = Date.now();
      if(!storageToken){
        return null
      }
      if (!expiration || expiration < now) {
        removeStorageData(type);
        return null;
      } else {
        return storageToken.token;
      }
    } catch {
      return null;
    }
  };

  const requestAccessToken = async (refreshToken: string) => {
    try {
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

  const getAccessToken = async () => {
    let accessToken = getTokenFromLocalStorage('accessToken');
    if (!accessToken) {
      const refreshToken = getTokenFromLocalStorage('refreshToken');
      if (!refreshToken) {
        userContext?.setUser(null);
        return null;
      }
      accessToken = await requestAccessToken(refreshToken);
    }
    return accessToken;
  };

  return { getAccessToken, getTokenFromLocalStorage, getStorageItem };
};
