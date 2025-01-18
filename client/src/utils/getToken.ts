import { EnqueueSnackbar } from 'notistack';
import { requestAccessToken } from './requestAccessToken';

export type StorageToken = {
  token: string;
  expiration: number;
};

export const getTokenFromLocalStorage = (type: 'accessToken' | 'refreshToken') => {
  console.log(`get token type ${type} from local storage`)
  try {
    const storageToken = localStorage.getItem(type);
    console.log('storageToken: ', storageToken)
    if (!storageToken) {
      return null;
    }
    const token = JSON.parse(storageToken);
    // const token = {...base64Token, token: atob(base64Token.token)}
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
  // let accessToken = getTokenFromLocalStorage('accessToken');
  let accessToken = null
  if (!accessToken) {
    accessToken = await requestAccessToken(enqueueSnackbar);
  }
  return accessToken;
};
