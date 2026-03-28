import {getIngredients} from "@api/ingredients";
import {Button, Flex, Heading} from "@radix-ui/themes";
import {useUserDispatch, useUser} from "@hooks/user";
import {useEffect} from "react";
import usePage from "@hooks/page";
import IngredientsList from "@components/ingredients/IngredientsList";

const IdeasPage = () => {
  const {updatePage} = usePage();
  const dispatch = useUserDispatch();
  const {ingredients} = useUser();

  useEffect(() => {
    if (ingredients !== undefined) return;
    getIngredients().then((got) => {
      dispatch({
        action: "SET_INGREDIENTS",
        ingredients: got.ingredients,
      });
    });
  }, [ingredients, dispatch]);

  return (
    <>
      <Heading mb="6">Your pantry</Heading>
      <Heading size="3">What do you have available?</Heading>
      <IngredientsList />
      <Flex width="100%" justify="center" my="6">
        <Button
          onClick={() => {
            updatePage("/ingredients/ideas");
          }}
          style={{cursor: "var(--cursor-link)"}}
        >
          What can I eat today?
        </Button>
      </Flex>
    </>
  );
};

export default IdeasPage;
