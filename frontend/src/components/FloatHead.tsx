import usePage from "@hooks/page";
import {Box, Button, Card, Flex, Heading, Separator} from "@radix-ui/themes";

const FloatHead = () => (
  <Box position="fixed" m="4" top="0" left="0">
    <Card>
      <Box width="20vw">
        <LogoTitle />
        <Separator size="4" my="2" />
        <Flex direction="column" align="start" gap="4" p="4">
          <PageLink name="Groceries list" page="/groceries" />
          <PageLink name="Meal ideas" page="/ingredients" />
          <PageLink name="Profile" page="/profile" />
        </Flex>
        <Box height="3em" />
      </Box>
    </Card>
  </Box>
);

const LogoTitle = () => {
  const {updatePage} = usePage();
  return (
    <Flex direction="row" align="center" gap="4" p="1">
      <Button
        variant="ghost"
        style={{background: "none", cursor: "var(--cursor-link)"}}
        onClick={() => updatePage("/")}
      >
        <img src="/icon.webp" alt="Logo" width="40" />
      </Button>
      <Heading size="6">Cooking</Heading>
    </Flex>
  );
};

const PageLink = ({name, page}) => {
  const {currPage, updatePage} = usePage();
  const lastSlash = currPage.indexOf("/", 1);
  const selected = lastSlash <= 0 ? currPage : currPage.slice(0, lastSlash);

  return (
    <Button
      variant="ghost"
      radius="full"
      style={{
        background: page === selected ? "var(--accent-9)" : undefined,
        color: page === selected ? "white" : "var(--gray-12)",
        cursor: "var(--cursor-link)",
      }}
      onClick={() => updatePage(page)}
    >
      <Heading size="3" weight="medium" mx="8px">
        {name}
      </Heading>
    </Button>
  );
};

export default FloatHead;
