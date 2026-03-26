import usePage from "@hooks/page";
import {AvatarIcon, CheckboxIcon, StackIcon} from "@radix-ui/react-icons";
import {Box, Card, Flex, IconButton, Tooltip} from "@radix-ui/themes";

const FloatHeadCompact = () => (
  <Box position="fixed" m="4" top="0" left="0">
    <Card>
      <Flex direction="column" gap="4">
        <PageButton name="Groceries list" page="/groceries">
          <CheckboxIcon {...iconSize} />
        </PageButton>
        <PageButton name="Meal ideas" page="/ingredients">
          <StackIcon {...iconSize} />
        </PageButton>
        <PageButton name="Profile" page="/profile">
          <AvatarIcon {...iconSize} />
        </PageButton>
      </Flex>
    </Card>
  </Box>
);

const PageButton = ({name, page, children}) => {
  const {currPage, updatePage} = usePage();
  const lastSlash = currPage.indexOf("/", 1);
  const selected = lastSlash <= 0 ? currPage : currPage.slice(0, lastSlash);

  return (
    <Tooltip content={name}>
      <IconButton
        variant="ghost"
        radius="full"
        style={{
          background: page === selected ? "var(--accent-9)" : undefined,
          color: page === selected ? "white" : "var(--gray-12)",
          cursor: "var(--cursor-link)",
        }}
        onClick={() => updatePage(page)}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
};

const iconSize = {
  width: "20",
  height: "20",
};

export default FloatHeadCompact;
