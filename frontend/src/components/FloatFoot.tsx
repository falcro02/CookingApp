import { Text, Card, Flex, IconButton, Link, Popover, Tooltip } from '@radix-ui/themes';
import { GitHubLogoIcon, InfoCircledIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons"

const FloatFoot = ({ appearance, setAppearance }) => (
    <Card m="4" style={{
        position: 'fixed',
        zIndex: 1000,
        top: 10,
        right: 10,
    }}>
        <Flex direction="column" gap="4">
            <AppearanceToggle appearance={appearance} setAppearance={setAppearance} />
            <GitHubLink />
            <InfoPopover />
        </Flex>
    </Card >
)

const AppearanceToggle = ({ appearance, setAppearance }) => (
    <Tooltip content="Toggle appearance">
        <IconButton {...iconButtonProps()}
            onClick={() => setAppearance((prev: string) => (prev === 'dark' ? 'light' : 'dark'))} >
            {appearance === 'dark' ? (
                <SunIcon {...iconSize} />) : (
                <MoonIcon {...iconSize} />)}
        </IconButton>
    </Tooltip>
)

const GitHubLink = () => (
    <Tooltip content="Go to GitHub repository">
        <Link href="https://github.com/falcro02/CookingApp" target="_blank" underline="none" >
            <IconButton {...iconButtonProps(true)}>
                <GitHubLogoIcon {...iconSize} />
            </IconButton>
        </Link>
    </Tooltip>
)

const InfoPopover = () => (
    <Popover.Root>
        <Tooltip content="Show credits">
            <Popover.Trigger>
                <IconButton {...iconButtonProps()}>
                    <InfoCircledIcon {...iconSize} />
                </IconButton>
            </Popover.Trigger>
        </Tooltip>
        <Popover.Content>
            <Text size="2">
                Developed by
                <Link ml="1" href="https://github.com/matteobettiati" target="_blank">Matteo Bettiati</Link>,
                <Link ml="1" href="https://github.com/falcro02" target="_blank">Alessio Caggiano</Link>,
                <Link ml="1" href="https://github.com/fostidich" target="_blank">Francesco Ostidich</Link>
            </Text>
        </Popover.Content>
    </Popover.Root>
)

const iconSize = {
    width: "20",
    height: "20",
}

const iconButtonProps = (link: boolean = false) => {
    return {
        variant: "ghost",
        radius: "full",
        style: {
            color: "var(--gray-12)",
            cursor: link ? "var(--cursor-link)" : undefined,
        }
    }
}

export default FloatFoot

