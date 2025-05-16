import { enqueueSnackbar } from 'notistack';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../config/navigation/navigation';
import { ResetPasswordInput, useAuthRequests } from '../hooks/useAuthRequests';
import { StorageToken, useLocalStorage } from '../hooks/useLocalStorage';
import { RegisterUserData } from '../pages/register/Register';
import { handleError } from '../utils/errorHandling';
import { AuthContext } from './useAuthContext';

export type AuthContextType = {
  accessToken: string | null;
  login: (loginData: LoginData, redirectUrl: string) => Promise<void>;
  loginError: Error | null;
  loading: boolean;
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  registerUser: (registerData: RegisterUserData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (data: { email: string }) => Promise<void>;
  resetPassword: (data: ResetPasswordInput) => Promise<void>;
};

export type LoginResult = {
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

export interface AuthContextProviderProps {
  children: JSX.Element;
}

export const AuthProvider = ({ children }: AuthContextProviderProps) => {
  const navigate = useNavigate();
  const {
    loginMutation,
    loginError,
    loadingLogin,
    getAccessToken,
    useUserQuery,
    registerMutation,
    loadingRegistration,
    logoutMutation,
    loadingLogout,
    forgotPasswordMutation,
    loadingForgotPassword,
    resetPasswordMutation,
    loadingResetPassword,
  } = useAuthRequests();
  const { getTokenFromLocalStorage } = useLocalStorage();
  const [loginRedirectUrl, setLoginRedirectUrl] = useState(routes.posts.route);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const timeoutId = useRef<NodeJS.Timeout | undefined>(undefined);

  const [refreshTokenExpiration, setRefreshTokenExpiration] = useState<number | null>(
    () => getTokenFromLocalStorage('refreshToken')?.expiration || null
  );

  const { data: userData, error: userDataError, isLoading: loadingUserData } = useUserQuery(accessToken);

  useEffect(() => {
    getAccessToken().then((token) => setAccessToken(token?.token || null));
  }, []);

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
    await loginMutation({
      loginData: loginData,
      onSuccess: (response: LoginResult) => handleLoginResponse(response),
    });
  };

  const register = async (registerData: RegisterUserData) => {
    await registerMutation(registerData);
  };

  const logout = async () => {
    await logoutMutation({
      accessToken,
      onSuccess: () => {
        if (user) {
          setUser(null);
        }
        navigate(routes.login.route);
      },
    });
  };

  const forgotPassword = async (data: { email: string }) => {
    await forgotPasswordMutation(data);
  };

  const resetPassword = async (data: ResetPasswordInput) => {
    await resetPasswordMutation(data);
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        registerUser: register,
        login,
        loginError,
        loading:
          loadingLogin ||
          loadingUserData ||
          loadingRegistration ||
          loadingLogout ||
          loadingForgotPassword ||
          loadingResetPassword,
        user,
        setUser,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
