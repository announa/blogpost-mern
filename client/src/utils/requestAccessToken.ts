import axios, { AxiosError } from 'axios';
import { EnqueueSnackbar } from 'notistack';
import { handleAxiosError, handleNormalError } from './errorHandling';
import { getTokenFromLocalStorage, StorageToken } from './getToken';

export const requestAccessToken = async (enqueueSnackbar: EnqueueSnackbar) => {
  try {
    const refreshToken = getTokenFromLocalStorage('refreshToken');
    console.log('refreshToken: ', refreshToken)
    if (!refreshToken) {
      return null;
    }
    const result = await axios.post<{ accessToken: StorageToken }>(`${import.meta.env.VITE_AUTH_URL}/token`, {
      token: refreshToken,
    });
    const accessToken = result.data.accessToken;
    if (!accessToken) {
      throw Error();
    }
    localStorage.setItem('accessToken', JSON.stringify(accessToken));
    return accessToken.token;
  } catch (error) {
    if (error instanceof AxiosError) {
      handleAxiosError(error, enqueueSnackbar);
    } else {
      handleNormalError(error, enqueueSnackbar, 'Could not retrieve access token');
    }
    return null;
  }
};
