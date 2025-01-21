import { createContext, Dispatch, SetStateAction, useContext } from 'react';

export type User = {
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
}

export const UserContext = createContext<IUserContext | null>(null);

export const useUserContext = () => useContext(UserContext);
