import FloatFoot from './FloatFoot';
import FloatHead from './FloatHead';
import { Flex } from "@radix-ui/themes";

const Layout = ({ appearance, setAppearance, currentPage, setCurrentPage, children }) => {
    return (
        <>
            <header>
                <FloatHead currentPage={currentPage} setCurrentPage={setCurrentPage} />
            </header>
            <main>
                <Flex direction="column" px="30vw" py="4vh">
                    {children}
                </Flex>
            </main>
            <footer>
                <FloatFoot appearance={appearance} setAppearance={setAppearance} />
            </footer>
        </>
    );
}

export default Layout

