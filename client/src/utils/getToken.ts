import { EnqueueSnackbar } from 'notistack';
import { requestAccessToken } from './requestAccessToken';

export type StorageToken = {
  token: string;
  expiration: number;
};

export const getTokenFromLocalStorage = (type: 'accessToken' | 'refreshToken') => {
  try {
    const storageToken = localStorage.getItem(type);
    if (!storageToken) {
      return null;
    }
    const token = JSON.parse(storageToken);
    const expiration = token?.expiration;
    const now = new Date().getTime();
    if (expiration > now) {
      return token.token;
    } else {
      return null;
    }
  } catch {
    return null;
  }
};

export const getAccessToken = async (enqueueSnackbar: EnqueueSnackbar) => {
  let accessToken = null
  if (!accessToken) {
    accessToken = await requestAccessToken(enqueueSnackbar);
  }
  return accessToken;
};
