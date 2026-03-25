import {deletePlan, setCurrentPlan} from "@api/plans";
import useUser, {useUserDispatch} from "@hooks/user";
import {AlertDialog, Button, Flex} from "@radix-ui/themes";

const DeletePlanButton = () => {
  const dispatch = useUserDispatch();
  const {plans} = useUser();

  // If plan is empty (should always be 1 btw) then disable button
  const toDisable =
    Object.entries(plans?.plans[plans?.current] ?? {}).length === 0;

  return (
    <Flex justify="between" mx="8px" mt="10px">
      <AlertDialog.Root>
        <AlertDialog.Trigger>
          <Button variant="ghost" size="1" disabled={toDisable}>
            Clear
          </Button>
        </AlertDialog.Trigger>
        <AlertDialog.Content>
          <AlertDialog.Title>Delete selected plan</AlertDialog.Title>
          <AlertDialog.Description>
            This will delete this plan with all its meals.
          </AlertDialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button
                variant="solid"
                color="red"
                onClick={() => {
                  deletePlan(plans?.current).then(() => {
                    dispatch({action: "DELETE_PLAN"});

                    // Go back to last non-empty (or 1)
                    for (let i = 4; i > 0; i--) {
                      if (i !== 1 && i === plans?.current) continue;
                      const len = Object.keys(plans?.plans[i] ?? {}).length;
                      if (len > 0 || i === 1) {
                        setCurrentPlan({current: i}).finally(() => {
                          dispatch({action: "SET_CURRENT_PLAN", current: i});
                        });
                        break;
                      }
                    }
                  });
                }}
              >
                Delete
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Flex>
  );
};

export default DeletePlanButton;
