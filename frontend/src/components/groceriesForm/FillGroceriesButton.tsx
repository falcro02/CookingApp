import {
  FormFieldsRequest,
  generateGroceries,
  getGroceries,
} from "@api/groceries";
import {getTaskStatus} from "@api/tasks";
import usePage from "@hooks/page";
import useUser, {useUserDispatch} from "@hooks/user";
import {Button, Dialog, Flex, Spinner} from "@radix-ui/themes";
import {useEffect, useState} from "react";

type Status = "before" | "while" | "after" | "error";
type GenerateFuncProp = {generate: (replace: boolean) => void};

const FillGroceriesButton = ({
  formData,
}: {
  formData: Partial<FormFieldsRequest>;
}) => {
  const dispatch = useUserDispatch();
  const {updatePage} = usePage();

  const [status, setStatus] = useState<Status>("before");
  const [task, setTask] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const poll = async () => {
      if (!task || status !== "while") return;

      try {
        const got = await getTaskStatus(task);
        if (!isMounted) return;

        switch (got.status) {
          case -1:
            setStatus("error");
            break;
          case 0:
            timeoutId = setTimeout(poll, 2000);
            break;
          case 1:
            try {
              const res = await getGroceries();
              if (isMounted) {
                dispatch({
                  action: "SET_GROCERIES",
                  groceries: res.groceries,
                });
                setStatus("after");
              }
            } catch {
              if (isMounted) setStatus("error");
            }
            break;
          default:
            setStatus("error");
            break;
        }
      } catch {
        if (isMounted) setStatus("error");
      }
    };

    poll();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [task, status, dispatch]);

  const contentViews = {
    before: (
      <PanelBeforeGenerating
        generate={(replace: boolean) => {
          setStatus("while");
          const req: FormFieldsRequest = {
            ...(formData as FormFieldsRequest),
            replace: replace,
          };
          generateGroceries(req)
            .then((res) => {
              setTask(res.taskId);
            })
            .catch(() => {
              setStatus("error");
            });
        }}
      />
    ),
    while: <PanelWhileGenerating />,
    after: (
      <PanelAfterGenerating
        gotError={false}
        onClick={() => {
          setStatus("before");
          updatePage("/groceries");
        }}
      />
    ),
    error: (
      <PanelAfterGenerating
        gotError={true}
        onClick={() => {
          setStatus("before");
          updatePage("/groceries");
        }}
      />
    ),
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button
          size="2"
          disabled={formData.days?.length === 0 || formData.plan === null}
        >
          Generate groceries
        </Button>
      </Dialog.Trigger>
      {contentViews[status]}
    </Dialog.Root>
  );
};

const PanelAfterGenerating = ({gotError, onClick}) => {
  return (
    <Dialog.Content>
      <Dialog.Title>Generate groceries with AI</Dialog.Title>
      <Dialog.Description>
        {gotError
          ? "Error encountered while generating groceries."
          : "Groceries generated successfully!"}
      </Dialog.Description>
      <Flex gap="3" mt="6" justify="center">
        <Dialog.Close>
          <Button onClick={onClick} style={{cursor: "var(--cursor-link)"}}>
            See groceries
          </Button>
        </Dialog.Close>
      </Flex>
    </Dialog.Content>
  );
};

const PanelWhileGenerating = () => {
  return (
    <Dialog.Content>
      <Dialog.Title>Generate groceries with AI</Dialog.Title>
      <Dialog.Description>
        Please wait while generating groceries.
      </Dialog.Description>
      <Flex gap="3" mt="6" justify="center">
        <Spinner size="3" mb="4" />
      </Flex>
    </Dialog.Content>
  );
};

const PanelBeforeGenerating = ({generate}: GenerateFuncProp) => {
  const {groceries} = useUser();
  const hasGroceries = Object.keys(groceries?.groceries ?? {}).length !== 0;

  return (
    <Dialog.Content>
      <Dialog.Title>Generate groceries with AI</Dialog.Title>
      <Dialog.Description>
        {hasGroceries
          ? "What do you want to do with the newly generated groceries?"
          : "Ask the AI to fill your groceries."}
      </Dialog.Description>
      <Flex gap="3" mt="6" justify="center">
        {hasGroceries ? (
          <>
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              onClick={() => {
                generate(true);
              }}
            >
              Replace
            </Button>
            <Button
              onClick={() => {
                generate(false);
              }}
            >
              Append
            </Button>
          </>
        ) : (
          <>
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              onClick={() => {
                generate(false);
              }}
            >
              Generate
            </Button>
          </>
        )}
      </Flex>
    </Dialog.Content>
  );
};

export default FillGroceriesButton;
