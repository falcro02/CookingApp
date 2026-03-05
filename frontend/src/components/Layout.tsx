import FloatFoot from './FloatFoot';
import FloatHead from './FloatHead';
import { Box, Flex } from "@radix-ui/themes";
import FloatHeadCompact from './FloatHeadCompact';
import { useEffect, useState } from 'react';

const Layout = ({ appearance, setAppearance, currentPage, setCurrentPage, children }) => {
    const width = useWindowWidth();

    return (
        <>
            <header>
                {width < 1100
                    ? <FloatHeadCompact currentPage={currentPage} setCurrentPage={setCurrentPage} />
                    : <FloatHead currentPage={currentPage} setCurrentPage={setCurrentPage} />
                }
            </header>
            <main>
                <Box align="center" py="4vh" >
                    <Flex overflowX="hidden" align="start" direction="column" width={width < 830 ? "60vw" : "500px"}>
                        {children}
                    </Flex>
                </Box>
            </main>
            <footer>
                <FloatFoot appearance={appearance} setAppearance={setAppearance} />
            </footer>
        </>
    )
}

const useWindowWidth = () => {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const updateWidth = () => setWidth(window.innerWidth);
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    return width;
}

export default Layout

