import {PageContext} from "@hooks/page";
import {useState} from "react";
import {useLocation} from "react-router-dom";

const PageProvider = ({children}) => {
  const location = useLocation();
  const pathname = location.pathname;
  const [page, setPage] = useState(pathname === "/" ? "/groceries" : pathname);

  return (
    <PageContext.Provider value={{page, setPage}}>
      {children}
    </PageContext.Provider>
  );
};

export default PageProvider;
