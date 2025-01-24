import { Box } from '@mui/material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { ReactNode, useEffect, useState } from 'react';
import { useToken } from '../hooks/useToken';
import { handleError } from '../utils/errorHandling';
import { User, UserContext } from './useUserContext';

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { getAccessToken, getStorageItem } = useToken();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTokenExpiration, setRefreshTokenExpiration] = useState<number | null>(null);

  const getUserData = async () => {
    try {
      const accessToken = await getAccessToken();
      const refreshToken = getStorageItem('refreshToken');
      if (refreshToken?.expiration) {
        setRefreshTokenExpiration(refreshToken.expiration);
      } else if (accessToken && refreshToken && !refreshToken.expiration) {
        console.warn('Refresh token expiration missing. Automatic user login verification not possible');
      }
      if (accessToken) {
        const result = await axios.get(import.meta.env.VITE_USER_URL, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const userData = result.data ?? null;
        setUser(userData);
      }
    } catch (error) {
      handleError(error, enqueueSnackbar);
    }
    setLoading(false);
  };
  useEffect(() => {
    getUserData();
  }, []);

  return (
    <UserContext.Provider
      value={{ user, setUser, refreshTokenExpiration, setRefreshTokenExpiration, loading }}
    >
      <Box>{children}</Box>
    </UserContext.Provider>
  );
};
