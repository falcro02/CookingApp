import {addMeal, deleteMeal, patchMeal} from "@api/meals";
import {setCurrentPlan} from "@api/plans";
import EmojiSlot from "@components/EmojiSlot";
import useUser, {UserAction, useUserDispatch} from "@hooks/user";
import {Cross2Icon} from "@radix-ui/react-icons";
import {Box, TextField, IconButton, Flex} from "@radix-ui/themes";
import {Dispatch} from "react";

const PlanMealRow = ({id, day, icon, description}) => {
  const dispatch = useUserDispatch();
  const {plans} = useUser();

  return (
    <Flex direction="row" align="center">
      <EmojiButton
        id={id}
        description={description}
        icon={icon}
        dispatch={dispatch}
      />
      <Box width="100%" mx="13px">
        <TextField.Root
          id={"_" + id}
          placeholder="New meal"
          size="2"
          defaultValue={description}
          variant="soft"
          onBlur={(e) => {
            const curr = plans?.current ?? 1;
            const len = Object.keys(plans?.plans[curr] ?? {}).length;
            const newVal = e.target.value;
            onBlurUpdateItem(newVal, id, len, curr, day, icon, dispatch);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur();
          }}
          style={{background: "transparent"}}
        ></TextField.Root>
      </Box>
      <DeleteButton id={id} plans={plans} dispatch={dispatch} />
    </Flex>
  );
};

const EmojiButton = ({id, description, icon, dispatch}) => (
  <EmojiSlot
    disabled={description == ""}
    icon={icon}
    onEmojiClick={(e: {emoji: string}) => {
      const item = {icon: e.emoji};
      patchMeal(id, item).then(() => {
        dispatch({action: "EDIT_MEAL", id, meal: item});
      });
    }}
  />
);

const DeleteButton = ({id, plans, dispatch}) => (
  <IconButton
    variant="ghost"
    radius="full"
    onClick={() => {
      const delAct = () => {
        dispatch({action: "DELETE_MEAL", id});
      };
      const setCurrAct = (n: number) => {
        dispatch({action: "SET_CURRENT_PLAN", current: n});
      };

      if (id === "") delAct();
      else
        deleteMeal(id).then(() => {
          delAct();

          // Go on if it was last element in plan.
          // "- 1" to this plan because we've still the old ref.
          const thisLen =
            Object.keys(plans?.plans[plans?.current] ?? {}).length - 1;
          if (thisLen > 0) return;

          // Go back to last non-empty (or 1)
          for (let i = 4; i > 0; i--) {
            let len = Object.keys(plans?.plans[i] ?? {}).length;
            if (i === plans?.current) len--;
            if (len > 0 || i === 1) {
              setCurrentPlan({current: i}).finally(() => {
                setCurrAct(i);
              });
              break;
            }
          }
        });
    }}
  >
    <Cross2Icon height="12" width="12" />
  </IconButton>
);

function onBlurUpdateItem(
  newVal: string,
  id: string,
  planLen: number,
  currPlan: number,
  day: number,
  icon: string,
  dispatch: Dispatch<UserAction>,
) {
  const delAct = (actId: string) => {
    dispatch({
      action: "DELETE_MEAL",
      id: actId,
    });
  };
  const addAct = (actId: string) => {
    dispatch({
      action: "ADD_MEAL",
      id: actId,
      meal: {
        description: newVal,
        weekDay: day,
        icon: icon,
      },
    });
  };
  const editAct = (actId: string) => {
    dispatch({
      action: "EDIT_MEAL",
      id: actId,
      meal: {
        description: newVal,
        weekDay: day,
        icon: icon,
      },
    });
  };

  if (newVal === "")
    if (id === "") delAct(id);
    else
      deleteMeal(id).then(() => {
        delAct(id);
      });
  else if (id === "")
    addMeal({
      description: newVal,
      plan: currPlan,
      weekDay: day,
      icon: icon,
    }).then((res) => {
      addAct(res.itemId);
      delAct(id);
      if (planLen == 1) setCurrentPlan({current: currPlan});
    });
  else
    patchMeal(id, {
      description: newVal,
      weekDay: day,
      icon: icon,
    }).then(() => {
      editAct(id);
    });
}

export default PlanMealRow;
