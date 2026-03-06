import { createContext, useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface PageContextType {
    page: string;
    setPage: (page: string) => void;
}

const PageContext = createContext<PageContextType | null>(null);

export const PageProvider = ({ children }) => {
    const location = useLocation();
    const pathname = location.pathname;
    const [page, setPage] = useState(pathname === "/" ? "/groceries" : pathname);

    return (
        <PageContext.Provider value={{ page, setPage }}>
            {children}
        </PageContext.Provider>
    );
};

export const usePage = () => {
    const context = useContext(PageContext);
    if (!context) throw new Error('usePage must be in PageProvider');
    const navigate = useNavigate();
    const updatePage = (page: string) => {
        navigate(page);
        context.setPage(page === "/" ? "/groceries" : page);
    };
    return {
        currPage: context.page,
        updatePage
    };
};

