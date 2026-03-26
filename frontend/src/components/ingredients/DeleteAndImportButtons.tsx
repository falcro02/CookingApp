import {
  clearIngredients,
  getIngredients,
  importIngredients,
} from "@api/ingredients";
import useUser, {useUserDispatch} from "@hooks/user";
import {Text, AlertDialog, Button, Flex, Spinner} from "@radix-ui/themes";
import {useState} from "react";

const DeleteAndImportButtons = () => {
  return (
    <Flex justify="between">
      <DeleteButton />
      <ImportButton />
    </Flex>
  );
};

const DeleteButton = () => {
  const dispatch = useUserDispatch();
  const {ingredients} = useUser();

  // If list is empty the buttons should be disabled
  const toDisable = Object.keys(ingredients?.ingredients ?? {}).length === 0;

  return (
    <Flex justify="between" mx="8px" mt="10px">
      <AlertDialog.Root>
        <AlertDialog.Trigger>
          <Button variant="ghost" size="1" disabled={toDisable}>
            Clear
          </Button>
        </AlertDialog.Trigger>
        <AlertDialog.Content>
          <AlertDialog.Title>Delete all ingredients</AlertDialog.Title>
          <AlertDialog.Description>
            This will delete all the ingredients in the pantry.
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
                  clearIngredients().then(() => {
                    dispatch({action: "CLEAR_INGREDIENTS"});
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

const ImportButton = () => {
  const dispatch = useUserDispatch();
  const [status, setStatus] = useState<Status>("before");

  const contentViews = {
    before: (
      <Flex gap="3" mt="4" justify="end">
        <AlertDialog.Cancel>
          <Button variant="soft" color="gray">
            Cancel
          </Button>
        </AlertDialog.Cancel>
        <Button
          variant="solid"
          onClick={() => {
            setStatus("while");
            importIngredients()
              .then(() => {
                getIngredients()
                  .then((got) => {
                    dispatch({
                      action: "SET_INGREDIENTS",
                      ingredients: got.ingredients,
                    });
                    setStatus("after");
                  })
                  .catch(() => {
                    setStatus("error");
                  });
              })
              .catch(() => {
                setStatus("error");
              });
          }}
        >
          Import
        </Button>
      </Flex>
    ),
    while: (
      <Flex mt="4" justify="center">
        <Spinner size="3" my="6px" />
      </Flex>
    ),
    after: (
      <Flex gap="3" mt="4" align="center" justify="end">
        <Text
          size="2"
          style={{
            color: "var(--accent-indicator)",
          }}
        >
          Done!
        </Text>
        <AlertDialog.Cancel>
          <Button
            onClick={() => {
              setStatus("before");
            }}
          >
            Back
          </Button>
        </AlertDialog.Cancel>
      </Flex>
    ),
    error: (
      <Flex gap="3" mt="4" align="center" justify="end">
        <Text color="red" size="2">
          Error
        </Text>
        <AlertDialog.Cancel>
          <Button
            onClick={() => {
              setStatus("before");
            }}
          >
            Back
          </Button>
        </AlertDialog.Cancel>
      </Flex>
    ),
  };

  return (
    <Flex justify="between" mx="8px" mt="10px">
      <AlertDialog.Root>
        <AlertDialog.Trigger>
          <Button variant="ghost" size="1">
            Import groceries
          </Button>
        </AlertDialog.Trigger>
        <AlertDialog.Content>
          <AlertDialog.Title>Import checked groceries</AlertDialog.Title>
          <AlertDialog.Description>
            Add all the groceries currently checked as new ingredients in the
            pantry.
          </AlertDialog.Description>
          {contentViews[status]}
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Flex>
  );
};

type Status = "before" | "while" | "after" | "error";

export default DeleteAndImportButtons;
