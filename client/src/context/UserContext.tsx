import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';

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
export const UserContextProvider = ({children}: {children: ReactNode}) => {
  const [user, setUser] = useState<User | null>(null);
  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

export const useUserContext = () => useContext(UserContext)