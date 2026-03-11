import {UserContext, userReducer} from "@hooks/user";
import {useReducer} from "react";

const UserProvider = ({children}) => {
  const [userState, dispatch] = useReducer(userReducer, null);
  return (
    <UserContext.Provider value={{user: userState, dispatch}}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
