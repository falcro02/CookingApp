import {getPlans} from "@api/plans";
import usePage from "@hooks/page";
import useUser, {useUserDispatch} from "@hooks/user";
import {Button, Card, Box, Flex, Spinner, Heading} from "@radix-ui/themes";
import {useState, useCallback, useEffect} from "react";

const TodaysMenu = () => {
  const {updatePage} = usePage();
  return (
    <Button
      asChild
      my="4"
      style={{cursor: "var(--cursor-link)"}}
      onClick={() => updatePage("/groceries/plans")}
    >
      <Card asChild>
        <Box height="100%" width="100%" px="50px" py="20px">
          <Flex justify="center">
            <TodaysMenuContent />
          </Flex>
        </Box>
      </Card>
    </Button>
  );
};

const TodaysMenuContent = () => {
  const dispatch = useUserDispatch();
  const {plans} = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [gotError, setGotError] = useState(false);

  // Prepare a callback function to call the get plans endpoint and update the
  // local representation of those
  const loadPlans = useCallback(async () => {
    setIsLoading(true);
    setGotError(false);
    try {
      const got = await getPlans();
      dispatch({
        action: "SET_PLANS",
        plans: got.plans,
        current: got.current,
      });
    } catch {
      setGotError(true);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  // If it is the first time opening the app (plans were not populated before)
  // load plans (calling endpoint and populating representation)
  useEffect(() => {
    if (plans !== undefined) return;
    loadPlans();
  }, [plans, loadPlans]);

  if (gotError) return "ERROR";
  if (isLoading) return <Spinner m="10px" />;
  if (!plans) return;

  // Find the current plan selected
  const currPlan = plans.plans[plans.current];
  if (Object.keys(currPlan).length === 0) return "Tap to create a plan";

  return (
    <Flex justify="between" width="80%">
      {Object.entries(currPlan).map(([id, item]) => (
        <Heading size="7" key={id}>
          {item.icon}
        </Heading>
      ))}
    </Flex>
  );
};

export default TodaysMenu;
