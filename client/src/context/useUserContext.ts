import { createContext, Dispatch, SetStateAction, useContext } from 'react';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
};

export interface IUserContext {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  refreshTokenExpiration: number | null;
  setRefreshTokenExpiration: Dispatch<SetStateAction<number | null>>;
  loading: boolean;
}

export const UserContext = createContext<IUserContext | null>(null);

export const useUserContext = () => useContext(UserContext);
