import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { createContext, Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../config/navigation/navigation';
import { useAuthRequests } from '../hooks/useAuthRequests';
import { StorageToken, useLocalStorage } from '../hooks/useLocalStorage';
import { handleError } from '../utils/errorHandling';

export type AuthContextType = {
  accessToken: string | null;
  login: (loginData: LoginData, redirectUrl: string) => void;
  loginError: Error | null;
  loading: boolean;
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>
  // logout: () => void;
};

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

export const AuthContext = createContext<AuthContextType | null>(null);

export interface AuthContextProviderProps {
  children: JSX.Element;
}

export const AuthProvider = ({ children }: AuthContextProviderProps) => {
  const navigate = useNavigate();
  const { loginMutation, loginError, loadingLogin, getAccessToken } = useAuthRequests();
  const { getTokenFromLocalStorage } = useLocalStorage();
  const [loginRedirectUrl, setLoginRedirectUrl] = useState(routes.posts.route);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const timeoutId = useRef<NodeJS.Timeout | undefined>(undefined);

  const [refreshTokenExpiration, setRefreshTokenExpiration] = useState<number | null>(
    () => getTokenFromLocalStorage('refreshToken')?.expiration || null
  );

  useEffect(() => {
    getAccessToken().then((token) => setAccessToken(token?.token || null));
  }, []);

  const {
    data: userData,
    error: userDataError,
    isLoading: loadingUserData,
  } = useQuery({
    queryKey: ['user', accessToken],
    queryFn: async () => {
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

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);

  useEffect(() => {
    if (userDataError) {
      handleError(userDataError, enqueueSnackbar);
    }
  }, [userDataError]);

  const verifyUserIsLoggedIn = () => {
    clearTimeout(timeoutId.current);
    if (refreshTokenExpiration) {
      const newTimeout = refreshTokenExpiration - Date.now();
      timeoutId.current = setTimeout(async () => {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          setUser(null);
          return;
        }
        localStorage.setItem('accessToken', JSON.stringify(accessToken));
        setAccessToken(accessToken.token);
      }, newTimeout);
    }
  };

  useEffect(() => {
    verifyUserIsLoggedIn();
  }, [refreshTokenExpiration]);

  const handleLoginResponse = (loginResponse: LoginResult) => {
    const { accessToken, refreshToken, data: user } = loginResponse;
    localStorage.setItem('accessToken', JSON.stringify(accessToken));
    localStorage.setItem('refreshToken', JSON.stringify(refreshToken));
    setAccessToken(accessToken.token);
    setUser(user);
    setRefreshTokenExpiration(refreshToken.expiration);
    navigate(loginRedirectUrl);
  };

  const login = async (loginData: LoginData, redirectUrl: string) => {
    setLoginRedirectUrl(redirectUrl);
    const response = await loginMutation(loginData);
    handleLoginResponse(response);
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        login,
        loginError,
        loading: loadingLogin && loadingUserData,
        user,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
