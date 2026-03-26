import {
  addIngredient,
  deleteIngredient,
  patchIngredient,
} from "@api/ingredients";
import {UserAction, useUserDispatch} from "@hooks/user";
import {Cross2Icon} from "@radix-ui/react-icons";
import {Box, Flex, IconButton, TextField} from "@radix-ui/themes";
import {Dispatch} from "react";

const IngredientRow = ({id, item}) => {
  const dispatch = useUserDispatch();

  return (
    <Flex direction="row" align="center">
      <Box width="100%" height="24px">
        <TextField.Root
          id={"_" + id}
          placeholder="New item"
          size="1"
          defaultValue={item.description}
          variant="soft"
          onBlur={(e) => {
            const newVal = e.target.value;
            onBlurUpdateItem(newVal, id, dispatch);
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
          const delAct = () => {
            dispatch({action: "DELETE_INGREDIENT", id});
          };
          if (id === "") delAct();
          else deleteIngredient(id).then(delAct);
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
  dispatch: Dispatch<UserAction>,
) {
  const delAct = (actId: string) => {
    dispatch({
      action: "DELETE_INGREDIENT",
      id: actId,
    });
  };
  const addAct = (actId: string) => {
    dispatch({
      action: "ADD_INGREDIENT",
      id: actId,
      item: {
        description: newVal,
      },
    });
  };
  const editAct = (actId: string) => {
    dispatch({
      action: "EDIT_INGREDIENT",
      id: actId,
      item: {
        description: newVal,
      },
    });
  };

  if (newVal === "") {
    if (id === "") delAct(id);
    else
      deleteIngredient(id).then(() => {
        delAct(id);
      });
  } else {
    if (id === "")
      addIngredient({description: newVal}).then((res) => {
        addAct(res.itemId);
        delAct(id);
      });
    else
      patchIngredient(id, {description: newVal}).then(() => {
        editAct(id);
      });
  }
}

export default IngredientRow;
