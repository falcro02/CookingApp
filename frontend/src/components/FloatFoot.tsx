import {
  Text,
  Card,
  Flex,
  IconButton,
  Link,
  Popover,
  Tooltip,
  Box,
} from "@radix-ui/themes";
import {
  GitHubLogoIcon,
  InfoCircledIcon,
  MoonIcon,
  SunIcon,
} from "@radix-ui/react-icons";
import useAppearance from "@hooks/appearance";

const FloatFoot = () => (
  <Box position="fixed" m="4" right="0" top="0">
    <Card>
      <Flex direction="column" gap="4">
        <AppearanceToggle />
        <GitHubLink />
        <InfoPopover />
      </Flex>
    </Card>
  </Box>
);

const AppearanceToggle = () => {
  const {appearance, setAppearance} = useAppearance();
  return (
    <Tooltip content="Toggle appearance">
      <IconButton
        variant="ghost"
        radius="full"
        style={{
          color: "var(--gray-12)",
        }}
        onClick={() => setAppearance(appearance === "dark" ? "light" : "dark")}
      >
        {appearance === "dark" ? (
          <SunIcon {...iconSize} />
        ) : (
          <MoonIcon {...iconSize} />
        )}
      </IconButton>
    </Tooltip>
  );
};

const GitHubLink = () => (
  <Tooltip content="Go to GitHub repository">
    <IconButton
      variant="ghost"
      radius="full"
      style={{
        color: "var(--gray-12)",
        cursor: "var(--cursor-link)",
      }}
      asChild
    >
      <Link
        href="https://github.com/falcro02/CookingApp"
        target="_blank"
        underline="none"
      >
        <GitHubLogoIcon {...iconSize} />
      </Link>
    </IconButton>
  </Tooltip>
);

const InfoPopover = () => (
  <Popover.Root>
    <Tooltip content="Show credits">
      <Popover.Trigger>
        <IconButton
          variant="ghost"
          radius="full"
          style={{
            color: "var(--gray-12)",
          }}
        >
          <InfoCircledIcon {...iconSize} />
        </IconButton>
      </Popover.Trigger>
    </Tooltip>
    <Popover.Content>
      <Text size="2">
        Developed by
        <Link ml="1" href="https://github.com/matteobettiati" target="_blank">
          Matteo Bettiati
        </Link>
        ,
        <Link ml="1" href="https://github.com/falcro02" target="_blank">
          Alessio Caggiano
        </Link>
        ,
        <Link ml="1" href="https://github.com/fostidich" target="_blank">
          Francesco Ostidich
        </Link>
      </Text>
    </Popover.Content>
  </Popover.Root>
);

const iconSize = {
  width: "20",
  height: "20",
};

export default FloatFoot;
