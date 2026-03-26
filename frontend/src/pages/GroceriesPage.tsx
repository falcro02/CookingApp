import {getGroceries} from "@api/groceries";
import {getPlans} from "@api/plans";
import ShoppingList from "@components/groceries/ShoppingList";
import TodaysMenu from "@components/groceries/TodaysMenu";
import usePage from "@hooks/page";
import useUser, {useUserDispatch} from "@hooks/user";
import {MagicWandIcon} from "@radix-ui/react-icons";
import {Button, Flex, Heading} from "@radix-ui/themes";
import {useEffect} from "react";

const GroceriesPage = () => {
  const {updatePage} = usePage();
  const dispatch = useUserDispatch();
  const {groceries, plans} = useUser();

  useEffect(() => {
    if (groceries !== undefined) return;
    getGroceries().then((got) => {
      dispatch({
        action: "SET_GROCERIES",
        groceries: got.groceries,
      });
    });
  }, [groceries, dispatch]);

  useEffect(() => {
    if (plans !== undefined) return;
    getPlans().then((got) => {
      dispatch({
        action: "SET_PLANS",
        plans: got.plans,
        current: got.current,
      });
    });
  }, [plans, dispatch]);

  return (
    <>
      <Heading mb="4">Your groceries</Heading>
      <Heading mt="2" size="3">
        Today's menu
      </Heading>
      <TodaysMenu />
      <Flex mt="4" direction="row" justify="between" align="end" width="100%">
        <Heading size="3">Your shopping list</Heading>
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
