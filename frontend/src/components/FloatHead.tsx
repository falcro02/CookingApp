import { Box, Button, Card, Flex, Heading, Link, Separator } from '@radix-ui/themes';

const FloatHead = () => (
    <Card m="4" style={{
        position: 'fixed',
        zIndex: 1000,
        top: 10,
        left: 10,
    }}>
        <Box width="20vw">
            <LogoTitle />
            <Separator size="4" my="2" />
            <Flex direction="column" gap="3" p="4">
                {/* TODO: keep selected colored */}
                <PageLink name="Groceries list" ref="#shopping" />
                <PageLink name="Meal ideas" ref="#ideas" />
                <PageLink name="Profile" ref="#profile" />
            </Flex>
            <Box height="3em" />
        </Box>
    </Card>
)

const LogoTitle = () => (
    <Flex direction="row" align="center" gap="4">
        <Link href="#home" underline="none">
            <Box p="1">
                <img src="/icon.webp" alt="Logo" width="40" />
            </Box>
        </Link>
        <Heading size="6">Cooking</Heading>
    </Flex>
)

const PageLink = ({ name, ref }) => (
    <Link href={ref} underline="none" >
        <Button variant="ghost" radius="full" style={{ color: "var(--gray-12)" }}>
            <Heading size="3" weight="medium">
                {name}
            </Heading>
        </Button>
    </Link >
)

export default FloatHead

