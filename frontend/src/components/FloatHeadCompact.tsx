import { AvatarIcon, CheckboxIcon, StackIcon } from '@radix-ui/react-icons';
import { Box, Text, Button, Card, Flex, Heading, IconButton, HoverCard, Separator, Tooltip } from '@radix-ui/themes';

const FloatHeadCompact = ({ currentPage, setCurrentPage }) => {
    pageHelper = { currentPage, setCurrentPage }
    return (
        < Card m="4" style={{
            position: 'fixed',
            zIndex: 1000,
            top: 10,
            left: 10,
        }}>
            <Flex direction="column" gap="4">
                <PageButton name="Groceries list" page="groceries" >
                    <CheckboxIcon {...iconSize} />
                </PageButton >
                <PageButton name="Meal ideas" page="ideas" >
                    <StackIcon {...iconSize} />
                </PageButton >
                <PageButton name="Profile" page="profile" >
                    <AvatarIcon {...iconSize} />
                </PageButton>
            </Flex>
        </Card >
    )
}

const PageButton = ({ name, page, children }) => (
    <Tooltip content={name}>
        <IconButton
            variant="ghost"
            radius="full"
            style={{
                background: page === pageHelper.currentPage ? "var(--accent-9)" : undefined,
                color: page === pageHelper.currentPage ? "white" : "var(--gray-12)",
                cursor: "var(--cursor-link)"
            }}
            onClick={() => pageHelper.setCurrentPage(page)}>
            {children}
        </IconButton>
    </Tooltip>
)

const iconSize = {
    width: "20",
    height: "20",
}

var pageHelper: { currentPage: string; setCurrentPage: (page: string) => void };

export default FloatHeadCompact

