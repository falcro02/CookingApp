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
        checked={!!checked}
        onCheckedChange={(newValue: boolean | "indeterminate") => {
          if (newValue === "indeterminate") return;
          patchGroceryItem(id, {checked: newValue}).then(() => {
            dispatch({action: "CHECK_GROCERY_ITEM", id, checked: newValue});
          });
        }}
      />
      <Box width="100%" height="24px">
        <TextField.Root
          id={"_" + id}
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
            textDecoration: checked ? "line-through" : "none",
          }}
        />
      </Box>
      <IconButton
        variant="ghost"
        radius="full"
        onClick={() => {
          const delAct = () => {
            dispatch({action: "DELETE_GROCERY_ITEM", id});
          };
          if (id === "") delAct();
          else deleteGroceryItem(id).then(delAct);
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
  const delAct = (actId: string) => {
    dispatch({
      action: "DELETE_GROCERY_ITEM",
      id: actId,
    });
  };
  const addAct = (actId: string) => {
    dispatch({
      action: "ADD_GROCERY_ITEM",
      id: actId,
      item: {
        checked: false,
        description: newVal,
        weekDay: day,
      },
    });
  };
  const editAct = (actId: string) => {
    dispatch({
      action: "EDIT_GROCERY_ITEM",
      id: actId,
      item: {
        description: newVal,
        weekDay: day,
      },
    });
  };

  if (newVal === "") {
    if (id === "") delAct(id);
    else
      deleteGroceryItem(id).then(() => {
        delAct(id);
      });
  } else {
    if (id === "")
      addGroceryItem({description: newVal, weekDay: day}).then((res) => {
        addAct(res.itemId);
        delAct(id);
      });
    else
      patchGroceryItem(id, {description: newVal}).then(() => {
        editAct(id);
      });
  }
}

export default GroceryItemCheckbox;
