import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { routes } from '../config/navigation/navigation';
import { LoginData, LoginResult, User } from '../context/AuthContextProvider';
import { StorageToken, useLocalStorage } from './useLocalStorage';

export const useAuthRequests = () => {
  const { getTokenFromLocalStorage } = useLocalStorage();

  const useUserQuery = (accessToken: string | null) => useQuery({
    queryKey: ['user', accessToken],
    queryFn: async ({queryKey: [, accessToken]}) => {
      const result = await axios.get<User>(import.meta.env.VITE_USER_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const userData = result.data ?? null;
      return userData;
    },
    enabled: !!accessToken,
  });

  const {
    mutateAsync: loginMutation,
    error: loginError,
    isPending: loadingLogin,
  } = useMutation({
    mutationKey: ['loginMutation'],
    mutationFn: async (loginData: LoginData) => {
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
    },
  });

  const { mutateAsync: requestAccessToken } = useMutation({
    mutationKey: ['requestAccessToken'],
    mutationFn: async (refreshToken: string) => {
      const response = await axios.post<{ accessToken: StorageToken }>(
        `${import.meta.env.VITE_AUTH_URL}/token`,
        {
          token: refreshToken,
        }
      );
      return response.data.accessToken;
    },
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
    useUserQuery
  };
};
