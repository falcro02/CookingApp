import {createContext, useContext} from "react";
import {useNavigate} from "react-router-dom";

interface PageContextType {
  page: string;
  setPage: (page: string) => void;
}

export const PageContext = createContext<PageContextType | null>(null);

const usePage = () => {
  const context = useContext(PageContext);
  if (!context) throw new Error("usePage must be in PageProvider");
  const navigate = useNavigate();
  const updatePage = (page: string) => {
    navigate(page);
    context.setPage(page === "/" ? "/groceries" : page);
  };
  return {
    currPage: context.page,
    updatePage,
  };
};

export default usePage;
