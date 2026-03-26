import useUser, {useUserDispatch} from "@hooks/user";
import {Box, Card, Flex, Separator, Spinner} from "@radix-ui/themes";
import IngredientRow from "@components/ingredients/IngredientRow";
import DeleteAndImportButtons from "@components/ingredients/DeleteAndImportButtons";
import TitleCard from "@components/DayNameCard";

const IngredientsList = () => {
  return (
    <Card asChild my="4">
      <Box width="100%" p="20px">
        <Flex direction="column" align="center">
          <IngredientsListContent />
        </Flex>
      </Box>
    </Card>
  );
};

const IngredientsListContent = () => {
  const {ingredients} = useUser();
  const dispatch = useUserDispatch();

  if (!ingredients) return <Spinner />;

  return (
    <Box width="100%">
      <TitleCard
        name="Ingredients at home"
        onPlusClick={() => {
          dispatch({
            action: "ADD_INGREDIENT",
            id: "",
            item: {
              description: "",
            },
          });
        }}
      />
      <Box px="13px" py="2">
        {Object.entries(ingredients?.ingredients ?? {}).map(([id, item]) => (
          <IngredientRow key={id} id={id} item={item} />
        ))}
      </Box>
      <Separator size="4" />
      <DeleteAndImportButtons />
    </Box>
  );
};

export default IngredientsList;
