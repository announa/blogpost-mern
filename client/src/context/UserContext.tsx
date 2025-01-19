import axios from 'axios';
import { useSnackbar } from 'notistack';
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from 'react';
import { handleError } from '../utils/errorHandling';
import { getAccessToken } from '../utils/getToken';

export type User = {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
};

export interface IUserContext {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
}

export const UserContext = createContext<IUserContext | null>(null);
export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [user, setUser] = useState<User | null>(null);

  const getUserData = async () => {
    try {
      const accessToken = await getAccessToken(enqueueSnackbar);
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

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

export const useUserContext = () => useContext(UserContext);
