import { Box, Button, Card, Flex, Heading, Separator } from '@radix-ui/themes';

const FloatHead = ({ currentPage, setCurrentPage }) => {
    pageHelper = { currentPage, setCurrentPage }
    return (
        < Card m="4" style={{
            position: 'fixed',
            zIndex: 1000,
            top: 10,
            left: 10,
        }}>
            <Box width="20vw">
                <LogoTitle />
                <Separator size="4" my="2" />
                <Flex direction="column" align="start" gap="4" p="4">
                    <PageLink name="Groceries list" page="groceries" />
                    <PageLink name="Meal ideas" page="ideas" />
                    <PageLink name="Profile" page="profile" />
                </Flex>
                <Box height="3em" />
            </Box>
        </Card >
    )
}

const LogoTitle = () => (
    <Flex direction="row" align="center" gap="4">
        <Button variant="ghost" style={{ background: "none", cursor: "var(--cursor-link)" }}
            onClick={() => pageHelper.setCurrentPage("groceries")}>
            <Box p="1">
                <img src="/icon.webp" alt="Logo" width="40" />
            </Box>
        </Button>
        <Heading size="6">Cooking</Heading>
    </Flex>
)

const PageLink = ({ name, page }) => {
    return (
        <Button variant="ghost" radius="full"
            style={{
                background: page === pageHelper.currentPage ? "var(--accent-9" : undefined,
                color: page === pageHelper.currentPage ? "white" : "var(--gray-12)",
                cursor: "var(--cursor-link)"
            }}
            onClick={() => pageHelper.setCurrentPage(page)}>
            <Heading size="3" weight="medium" mx="8px">{name}</Heading>
        </Button >
    )
}

var pageHelper: { currentPage: string; setCurrentPage: (page: string) => void };

export default FloatHead

