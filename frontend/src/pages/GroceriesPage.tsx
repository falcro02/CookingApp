import ShoppingList from "@components/ShoppingList";
import TodaysMenu from "@components/TodaysMenu";
import {Heading} from "@radix-ui/themes";

const GroceriesPage = () => {
  return (
    <>
      <Heading mb="4">Groceries list</Heading>
      <Heading mt="2" size="3">
        Today's menu
      </Heading>
      <TodaysMenu />
      <Heading mt="2" size="3">
        Your shopping list
      </Heading>
      <ShoppingList />
    </>
  );
};

export default GroceriesPage;
