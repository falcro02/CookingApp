import {generateIdeas, getIdeas} from "@api/ideas";
import {getTaskStatus} from "@api/tasks";
import ExtrasText from "@components/ExtrasText";
import useUser, {useUserDispatch} from "@hooks/user";
import {Button, Dialog, Flex, Spinner} from "@radix-ui/themes";
import {useEffect, useState} from "react";

type Status = "before" | "while" | "after" | "error";
type GenerateFuncProp = {generate: (extras: string) => void};

const GenerateIdeasButton = () => {
  const dispatch = useUserDispatch();
  const {ingredients} = useUser();
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
              const res = await getIdeas();
              if (isMounted) {
                dispatch({
                  action: "SET_IDEAS",
                  ideas: res.ideas,
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
        generate={(extra: string) => {
          setStatus("while");
          generateIdeas({extra})
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
        }}
      />
    ),
    error: (
      <PanelAfterGenerating
        gotError={true}
        onClick={() => {
          setStatus("before");
        }}
      />
    ),
  };

  const buttonDisabled =
    Object.keys(ingredients?.ingredients ?? {}).length === 0 ||
    Object.keys(ingredients?.ingredients ?? {}).some((n) => n === "");

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button disabled={buttonDisabled} size="2">
          Generate ideas
        </Button>
      </Dialog.Trigger>
      {contentViews[status]}
    </Dialog.Root>
  );
};

const PanelAfterGenerating = ({gotError, onClick}) => {
  return (
    <Dialog.Content>
      <Dialog.Title>Generate ideas with AI</Dialog.Title>
      <Dialog.Description>
        {gotError
          ? "Error encountered while generating ideas."
          : "Ideas generated successfully!"}
      </Dialog.Description>
      <Flex gap="3" mt="6" justify="center">
        <Dialog.Close>
          <Button onClick={onClick}>See ideas</Button>
        </Dialog.Close>
      </Flex>
    </Dialog.Content>
  );
};

const PanelWhileGenerating = () => {
  return (
    <Dialog.Content>
      <Dialog.Title>Generate ideas with AI</Dialog.Title>
      <Dialog.Description>
        Please wait while generating ideas.
      </Dialog.Description>
      <Flex gap="3" mt="6" justify="center">
        <Spinner size="3" mb="4" />
      </Flex>
    </Dialog.Content>
  );
};

const PanelBeforeGenerating = ({generate}: GenerateFuncProp) => {
  const {ideas} = useUser();
  const [extras, setExtras] = useState<string>("");
  const hasIdeas = Object.keys(ideas?.ideas ?? {}).length !== 0;

  return (
    <Dialog.Content>
      <Dialog.Title>Generate ideas with AI</Dialog.Title>
      <Dialog.Description>
        {"Ask the AI to give you meal ideas."}
        {hasIdeas && (
          <>
            <br />
            Generating new ideas will delete the old ones.
          </>
        )}
      </Dialog.Description>
      <ExtrasText
        onNewValue={(newVal: string) => {
          setExtras(newVal);
        }}
      />
      <Flex gap="3" mt="6" justify="center">
        <Dialog.Close>
          <Button variant="soft" color="gray">
            Cancel
          </Button>
        </Dialog.Close>
        <Button
          onClick={() => {
            generate(extras);
          }}
        >
          Generate
        </Button>
      </Flex>
    </Dialog.Content>
  );
};

export default GenerateIdeasButton;
