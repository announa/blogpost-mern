import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { routes } from '../config/navigation/navigation';
import { LoginData, LoginResult, User } from '../context/AuthContextProvider';
import { RegisterUserData } from '../pages/register/Register';
import { handleError } from '../utils/errorHandling';
import { StorageToken, useLocalStorage } from './useLocalStorage';

export type ResetPasswordInput = {
  password: string;
  token: string;
  userId: string;
  onError: (error: Error) => void;
};

export const useAuthRequests = () => {
  const { getTokenFromLocalStorage } = useLocalStorage();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const useUserQuery = (accessToken: string | null) =>
    useQuery({
      queryKey: ['user', accessToken],
      queryFn: async ({ queryKey: [, accessToken] }) => {
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
    mutationFn: async ({
      loginData,
    }: {
      loginData: LoginData;
      onSuccess: (response: LoginResult) => void;
    }) => {
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
    onSuccess: (response, { onSuccess }) => onSuccess(response),
    onError: (error) => handleError(error, enqueueSnackbar),
  });

  const { mutateAsync: registerMutation, isPending: loadingRegistration } = useMutation({
    mutationKey: ['register'],
    mutationFn: async (registerData: RegisterUserData) => {
      const response = await axios.post<User>(
        `${import.meta.env.VITE_AUTH_URL}${routes.register.route}`,
        registerData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      enqueueSnackbar('User successfully registered', { variant: 'success', autoHideDuration: 3000 });
      navigate(routes.login.route);
    },
    onError: (error) => handleError(error, enqueueSnackbar),
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
    onError: (error) => handleError(error, enqueueSnackbar),
  });

  const { mutateAsync: logoutMutation, isPending: loadingLogout } = useMutation({
    mutationKey: ['logout'],
    mutationFn: async ({ accessToken }: { accessToken: string | null; onSuccess: () => void }) => {
      await axios.post(
        `${import.meta.env.VITE_AUTH_URL}/logout`,
        {},
        {
          headers: {
            ['Authorization']: `Bearer ${accessToken}`,
          },
        }
      );
    },
    onSuccess: (_, variables) => {
      localStorage.clear();
      variables.onSuccess();
    },
    onError: (error) => handleError(error, enqueueSnackbar),
  });

  const { mutateAsync: forgotPasswordMutation, isPending: loadingForgotPassword } = useMutation({
    mutationKey: ['forgot-password'],
    mutationFn: async (data: { email: string }) =>
      await axios.post(`${import.meta.env.VITE_AUTH_URL}/request-reset-password`, data),
    onSuccess: () => {
      enqueueSnackbar('Email successfully sent', { variant: 'success' });
      navigate(routes.login.route);
    },
    onError: (error) => handleError(error, enqueueSnackbar),
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

  const { mutateAsync: resetPasswordMutation, isPending: loadingResetPassword } = useMutation({
    mutationKey: ['reset-password'],
    mutationFn: async ({ password, token, userId: id }: ResetPasswordInput) => {
      await axios.put(`${import.meta.env.VITE_AUTH_URL}/reset-password`, {
        password: password,
        token: token,
        userId: id,
      });
    },
    onSuccess: () => {
      enqueueSnackbar('Successfully updated password', { variant: 'success' });
      navigate(routes.login.route);
    },
    onError: (error, variables) => {
      variables.onError(error);
    },
  });

  return {
    getAccessToken,
    loginMutation,
    loginError,
    loadingLogin,
    registerMutation,
    loadingRegistration,
    logoutMutation,
    loadingLogout,
    useUserQuery,
    forgotPasswordMutation,
    loadingForgotPassword,
    resetPasswordMutation,
    loadingResetPassword,
  };
};
