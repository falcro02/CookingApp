import {usePage} from "@context/page";
import {AvatarIcon, CheckboxIcon, StackIcon} from "@radix-ui/react-icons";
import {Card, Flex, IconButton, Tooltip} from "@radix-ui/themes";

const FloatHeadCompact = () => (
  <Card
    m="4"
    style={{
      position: "fixed",
      zIndex: 1000,
      top: 10,
      left: 10,
    }}
  >
    <Flex direction="column" gap="4">
      <PageButton name="Groceries list" page="/groceries">
        <CheckboxIcon {...iconSize} />
      </PageButton>
      <PageButton name="Meal ideas" page="/ideas">
        <StackIcon {...iconSize} />
      </PageButton>
      <PageButton name="Profile" page="/profile">
        <AvatarIcon {...iconSize} />
      </PageButton>
    </Flex>
  </Card>
);

const PageButton = ({name, page, children}) => {
  const {currPage, updatePage} = usePage();
  return (
    <Tooltip content={name}>
      <IconButton
        variant="ghost"
        radius="full"
        style={{
          background: page === currPage ? "var(--accent-9)" : undefined,
          color: page === currPage ? "white" : "var(--gray-12)",
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
