import {clearIdeas} from "@api/ideas";
import {useUserDispatch} from "@hooks/user";
import {AlertDialog, Button, Flex} from "@radix-ui/themes";

const ClearButton = () => {
  const dispatch = useUserDispatch();

  return (
    <Flex justify="between" mx="8px" my="10px">
      <AlertDialog.Root>
        <AlertDialog.Trigger>
          <Button variant="ghost" size="2">
            Clear
          </Button>
        </AlertDialog.Trigger>
        <AlertDialog.Content>
          <AlertDialog.Title>Delete all ideas</AlertDialog.Title>
          <AlertDialog.Description>
            This will delete all the ideas in this page.
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
                  clearIdeas().then(() => {
                    dispatch({action: "CLEAR_IDEAS"});
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

export default ClearButton;
