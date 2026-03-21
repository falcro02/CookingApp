import ShoppingList from "@components/groceries/ShoppingList";
import TodaysMenu from "@components/groceries/TodaysMenu";
import usePage from "@hooks/page";
import {MagicWandIcon} from "@radix-ui/react-icons";
import {Button, Flex, Heading} from "@radix-ui/themes";

const GroceriesPage = () => {
  const {updatePage} = usePage();
  return (
    <>
      <Heading mb="4">Groceries list</Heading>
      <Heading mt="2" size="3">
        Today's menu
      </Heading>
      <TodaysMenu />
      <Flex direction="row" justify="between" align="end" width="100%">
        <Heading mt="2" size="3">
          Your shopping list
        </Heading>
        <Button
          variant="ghost"
          mr="8px"
          style={{cursor: "var(--cursor-link)"}}
          onClick={() => updatePage("/groceries/fill")}
        >
          <MagicWandIcon />
          Fill with AI
        </Button>
      </Flex>
      <ShoppingList />
    </>
  );
};

export default GroceriesPage;
