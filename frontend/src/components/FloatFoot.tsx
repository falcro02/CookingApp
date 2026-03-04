import { Text, Card, Flex, IconButton, Link, Popover } from '@radix-ui/themes';
import { GitHubLogoIcon, InfoCircledIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons"

const FloatFoot = ({ appearance, setAppearance }) => (
    <Card m="4" style={{
        position: 'fixed',
        zIndex: 1000,
        top: 10,
        right: 10,
    }}>
        <Flex direction="column" gap="4">
            <IconButton {...iconButtonProps} onClick={() =>
                setAppearance((prev: string) => (prev === 'dark' ? 'light' : 'dark'))
            }>
                {appearance === 'dark' ? (
                    <SunIcon width="20" height="20" />
                ) : (
                    <MoonIcon width="20" height="20" />
                )}
            </IconButton>
            <Link href="https://github.com/falcro02/CookingApp" target="_blank" underline="none" >
                <IconButton {...iconButtonProps}>
                    <GitHubLogoIcon width="20" height="20" />
                </IconButton>
            </Link>
            <Popover.Root>
                <Popover.Trigger>
                    <IconButton {...iconButtonProps}>
                        <InfoCircledIcon width="20" height="20" />
                    </IconButton>
                </Popover.Trigger>
                <Popover.Content>
                    <Text size="2">
                        Developed by
                        Matteo Bettiati,
                        Alessio Caggiano,
                        Francesco Ostidich
                    </Text>
                </Popover.Content>
            </Popover.Root>
        </Flex>
    </Card >
);

const iconButtonProps = {
    variant: "ghost",
    radius: "full",
    color: "gray",
    style: { color: "var(--gray-12)" },
} as const;

export default FloatFoot;

