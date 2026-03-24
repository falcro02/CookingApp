import {clearGroceries, checkGroceries} from "@api/groceries";
import useUser, {useUserDispatch} from "@hooks/user";
import {AlertDialog, Flex, Button} from "@radix-ui/themes";

const ClearAndCheckButtons = () => {
  const dispatch = useUserDispatch();
  const {groceries} = useUser();

  // If all items are checked, the "check all" button needs to become "uncheck all"
  const toCheck = Object.values(groceries?.groceries).some(
    (item) => !item.checked,
  );

  // If list is empty the buttons should be disabled
  const toDisable = Object.keys(groceries?.groceries ?? {}).length === 0;

  return (
    <Flex justify="between" mx="8px" mt="10px">
      <AlertDialog.Root>
        <AlertDialog.Trigger>
          <Button variant="ghost" size="1" disabled={toDisable}>
            Clear
          </Button>
        </AlertDialog.Trigger>
        <AlertDialog.Content>
          <AlertDialog.Title>Delete all groceries</AlertDialog.Title>
          <AlertDialog.Description>
            This will delete all the grocery items in all the lists.
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
                  clearGroceries().then(() => {
                    dispatch({action: "CLEAR_GROCERIES"});
                  });
                }}
              >
                Delete
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>

      <Button
        variant="ghost"
        size="1"
        disabled={toDisable}
        onClick={() => {
          checkGroceries({check: toCheck}).then(() => {
            dispatch({action: "CHECK_ALL_GROCERIES", check: toCheck});
          });
        }}
      >
        {toCheck ? "Check all" : "Uncheck all"}
      </Button>
    </Flex>
  );
};

export default ClearAndCheckButtons;
