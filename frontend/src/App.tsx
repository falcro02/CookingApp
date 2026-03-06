import Layout from '@components/Layout'
import { useAppearance } from '@context/appearance';
import GroceriesPage from '@pages/GroceriesPage';
import IdeasPage from '@pages/IdeasPage';
import ProfilePage from '@pages/Profile';
import UnknownPage from '@pages/Unknown';
import { Theme } from "@radix-ui/themes";
import { Route, Routes } from 'react-router-dom';

function App() {
    const { appearance } = useAppearance()
    return (
        <Theme accentColor="ruby" grayColor="sage" radius="large" appearance={appearance}>
            <Layout>
                <Routes>
                    <Route path="/" element={<GroceriesPage />} />
                    <Route path="/groceries" element={<GroceriesPage />} />
                    <Route path="/ideas" element={<IdeasPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="*" element={<UnknownPage />} />
                </Routes>
            </Layout>
        </Theme>)
}

export default App

