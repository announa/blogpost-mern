import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { routes } from '../config/navigation/navigation';
import { StorageToken, useLocalStorage } from './useLocalStorage';

type LoginResult = {
  accessToken: StorageToken;
  refreshToken: StorageToken;
  data: User;
};

export type LoginData = {
  email: string;
  password: string;
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
};


export const useAuthRequests = () => {
  const { getTokenFromLocalStorage } = useLocalStorage();

  const accessTokenRequest = async (refreshToken: string) => {
    const response = await axios.post<{ accessToken: StorageToken }>(
      `${import.meta.env.VITE_AUTH_URL}/token`,
      {
        token: refreshToken,
      }
    );
    return response.data.accessToken;
  };

  const { mutateAsync: requestAccessToken } = useMutation({
    mutationFn: (refreshToken: string) => accessTokenRequest(refreshToken),
  });

  const loginRequest = async (loginData: LoginData) => {
    const result = await axios.post<LoginResult>(
      `${import.meta.env.VITE_AUTH_URL}${routes.login.route}`,
      loginData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return result.data;
  };

  const {
    mutateAsync: loginMutation,
    error: loginError,
    isPending: loadingLogin,
  } = useMutation({
    mutationFn: loginRequest,
  });

  const getAccessToken = async () => {
    let accessToken = getTokenFromLocalStorage('accessToken');
    if (!accessToken) {
      const refreshToken = getTokenFromLocalStorage('refreshToken');
      if (!refreshToken) {
        return null;
      }
      accessToken = await requestAccessToken(refreshToken.token);
    }
    return accessToken;
  };

  return {
    getAccessToken,
    loginMutation,
    loginError,
    loadingLogin,
  };
};
