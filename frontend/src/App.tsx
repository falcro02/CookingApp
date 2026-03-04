import Layout from '@components/Layout'
import GroceriesPage from '@pages/GroceriesPage';
import IdeasPage from '@pages/IdeasPage';
import ProfilePage from '@pages/Profile';
import UnknownPage from '@pages/Unknown';
import { Theme } from "@radix-ui/themes";
import { useEffect, useState } from 'react';

const APP_APPEARANCE_KEY = 'theme-appearance';

function App() {
    const [appearance, setAppearance] = useState<'light' | 'dark'>(() => {
        const saved = localStorage.getItem(APP_APPEARANCE_KEY);
        return (saved as 'light' | 'dark') ?? 'dark';
    });

    useEffect(() => {
        localStorage.setItem(APP_APPEARANCE_KEY, appearance);
    }, [appearance]);

    const [currentPage, setCurrentPage] = useState('groceries');

    const renderPage = () => {
        switch (currentPage) {
            case 'groceries': return <GroceriesPage />;
            case 'ideas': return <IdeasPage />;
            case 'profile': return <ProfilePage />;
            default: return <UnknownPage setCurrentPage={setCurrentPage} />;
        }
    };

    return (
        <Theme accentColor="ruby" grayColor="sage" radius="large" appearance={appearance}>
            <Layout
                appearance={appearance} setAppearance={setAppearance}
                currentPage={currentPage} setCurrentPage={setCurrentPage}
            >
                {renderPage()}
            </Layout>
        </Theme>
    )
}

export default App

