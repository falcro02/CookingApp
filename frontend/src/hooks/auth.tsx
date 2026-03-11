import {AuthUser} from "aws-amplify/auth";
import {createContext, useContext} from "react";

interface AuthContextType {
  user: AuthUser;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be in AuthProvider");
  return {
    user: context.user,
    signOut: context.signOut,
  };
};

export default useAuth;
