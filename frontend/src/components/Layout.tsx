import FloatFoot from './FloatFoot';
import FloatHead from './FloatHead';
import { Flex } from "@radix-ui/themes";

const Layout = ({ appearance, setAppearance, children }) => {
    return (
        <>
            <header>
                <FloatHead />
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

