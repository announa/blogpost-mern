import { useContext } from "react";
import { AuthContext, AuthContextType } from "./AuthContextProvider";


export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthProvider must be used within an AuthProvider');
  }
  return context;
};