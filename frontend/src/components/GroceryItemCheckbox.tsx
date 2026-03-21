import {
  addGroceryItem,
  deleteGroceryItem,
  patchGroceryItem,
} from "@api/groceries";
import {UserAction, useUserDispatch} from "@hooks/user";
import {Cross2Icon} from "@radix-ui/react-icons";
import {Box, Checkbox, Flex, IconButton, TextField} from "@radix-ui/themes";
import {Dispatch} from "react";

const GroceryItemCheckbox = ({id, day, checked, description}) => {
  const dispatch = useUserDispatch();
  return (
    <Flex direction="row" justify="start" align="center">
      <Checkbox
        disabled={id === ""}
        variant="soft"
        mr="1"
        defaultChecked={!!checked}
        onCheckedChange={(newValue: boolean | "indeterminate") => {
          if (newValue === "indeterminate") return;
          patchGroceryItem(id, {checked: newValue}).then(() => {
            dispatch({action: "CHECK_GROCERY_ITEM", id, checked: newValue});
          });
        }}
      />
      <Box width="100%" height="24px">
        <TextField.Root
          placeholder="New item"
          size="1"
          defaultValue={description}
          variant="soft"
          onBlur={(e) => {
            onBlurUpdateItem(e.target.value, id, day, dispatch);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur();
          }}
          style={{
            background: "transparent",
          }}
        />
      </Box>
      <IconButton
        variant="ghost"
        radius="full"
        onClick={() => {
          deleteGroceryItem(id).then(() =>
            dispatch({action: "DELETE_GROCERY_ITEM", id}),
          );
        }}
      >
        <Cross2Icon height="12" width="12" />
      </IconButton>
    </Flex>
  );
};

function onBlurUpdateItem(
  newVal: string,
  id: string,
  day: number,
  dispatch: Dispatch<UserAction>,
) {
  if (newVal === "") {
    const act = () => {
      dispatch({action: "DELETE_GROCERY_ITEM", id});
    };
    if (id !== "") deleteGroceryItem(id).then(act);
    else act();
  } else {
    const act = (actId: string) => {
      dispatch({
        action: "EDIT_GROCERY_ITEM",
        id: actId,
        item: {
          description: newVal,
          weekDay: day,
        },
      });
    };
    if (id !== "")
      patchGroceryItem(id, {description: newVal}).then(() => {
        act(id);
      });
    else
      addGroceryItem({description: newVal, weekDay: day}).then((res) => {
        act(res.itemId);
        dispatch({action: "DELETE_GROCERY_ITEM", id});
      });
  }
}

export default GroceryItemCheckbox;
