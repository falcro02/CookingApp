import {deleteGroceryItem, patchGroceryItem} from "@api/groceries";
import {useUserDispatch} from "@hooks/user";
import {Cross2Icon} from "@radix-ui/react-icons";
import {Box, Checkbox, Flex, IconButton, Text} from "@radix-ui/themes";

const GroceryItemCheckbox = ({id, checked, description}) => {
  const dispatch = useUserDispatch();
  return (
    <Flex direction="row" justify="start" align="center">
      <Checkbox
        mr="1"
        defaultChecked={checked}
        onCheckedChange={(newValue: boolean | "indeterminate") => {
          if (newValue === "indeterminate") return;
          patchGroceryItem(id, {checked: newValue}).then(() => {
            dispatch({action: "CHECK_GROCERY_ITEM", id, checked: newValue});
          });
        }}
      />
      <Text size="2">{description}</Text>
      <Box width="100%" />
      <IconButton
        variant="ghost"
        radius="full"
        onClick={() => {
          deleteGroceryItem(id).then(() =>
            dispatch({action: "DELETE_GROCERY_ITEM", id}),
          );
        }}
      >
        <Cross2Icon />
      </IconButton>
    </Flex>
  );
};

export default GroceryItemCheckbox;
