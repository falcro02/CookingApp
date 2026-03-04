import { Box, Card, Flex, Heading, Link, Separator } from '@radix-ui/themes';

const FloatHead = () => (
    <Card m="4" style={{
        position: 'fixed',
        zIndex: 1000,
        top: 10,
        left: 10,
    }}>
        <Box width="20vw">
            <Flex direction="row" align="center" gap="4" mb="2">
                <HomeLink>
                    <Box p="1">
                        <img src="/icon.webp" alt="Logo" width="40" />
                    </Box>
                </HomeLink>
                <HomeLink>
                    <Heading size="6">Cooking</Heading>
                </HomeLink>
            </Flex>
            <Separator size="4" />
            <Flex direction="column" gap="2" p="4">
                <PageLink name="Groceries list" ref="#shopping" />
                <PageLink name="Meal ideas" ref="#ideas" />
                <PageLink name="Profile" ref="#profile" />
            </Flex>
            <Box height="3em" />
        </Box>
    </Card>
);

const PageLink = ({ name, ref }) => (
    <Link href={ref} size="3" weight="medium" underline="always" style={{
        color: "var(--gray-12)",
        textDecorationColor: "var(--gray-8)",
    }}>{name}</Link>
)

const HomeLink = ({ children }) => (
    <Link href="#home" style={{
        color: "var(--gray-12)",
        textDecorationColor: "var(--gray-8)",
    }}>{children}</Link>
)

export default FloatHead;

