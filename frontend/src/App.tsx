import Layout from '@components/Layout'
import { Heading, Theme } from "@radix-ui/themes";
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

    return (
        <Theme appearance={appearance} accentColor="ruby" grayColor="sage" radius="large">
            <Layout appearance={appearance} setAppearance={setAppearance}>
                <Heading size="6">
                    Cooking
                </Heading>
            </Layout>
        </Theme>
    )
}

export default App

