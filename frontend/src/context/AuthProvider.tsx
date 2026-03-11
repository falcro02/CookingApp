import {AuthContext} from "@hooks/auth";

const AuthProvider = ({user, signOut, children}) => {
  return (
    <AuthContext.Provider value={{user, signOut}}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
