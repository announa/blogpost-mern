import { Box } from '@mui/material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { ReactNode, useEffect, useState } from 'react';
import { useToken } from '../hooks/useToken';
import { handleError } from '../utils/errorHandling';
import { User, UserContext } from './useUserContext';

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { getAccessToken } = useToken();
  const [user, setUser] = useState<User | null>(null);
  const [refreshTokenExpiration, setRefreshTokenExpiration] = useState<number | null>(null);

  const getUserData = async () => {
    try {
      const accessToken = await getAccessToken();
      const result = await axios.get(import.meta.env.VITE_USER_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const userData = result.data ?? null;
      setUser(userData);
    } catch (error) {
      handleError(error, enqueueSnackbar);
    }
  };
  useEffect(() => {
    getUserData();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refreshTokenExpiration, setRefreshTokenExpiration }}>
      <Box>{children}</Box>
    </UserContext.Provider>
  );
};
