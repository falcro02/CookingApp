import {getPlans} from "@api/plans";
import useUser, {useUserDispatch} from "@hooks/user";
import {Heading, Card, Flex, Box, Spinner, Button} from "@radix-ui/themes";
import {PlanItem} from "@shared/types/plans";
import {useCallback, useEffect, useState} from "react";

const GroceriesPage = () => {
  return (
    <>
      <Heading mb="4">Groceries list</Heading>
      <Heading size="3">Today's menu</Heading>
      <TodaysMenu />
    </>
  );
};

const TodaysMenu = () => {
  return (
    <Button
      asChild
      my="4"
      style={{cursor: "var(--cursor-link)"}}
      onClick={() => alert("PlansPage missing")}
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

  const loadPlans = useCallback(async () => {
    if (plans !== undefined) return;

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

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  if (gotError) return "ERROR";
  if (isLoading) return <Spinner m="10px" />;
  if (!plans) return;

  const currPlan = plans.plans[plans.current];
  if (Object.keys(currPlan).length === 0) return "Tap to create a plan";

  return (
    <Flex justify="between" width="80%">
      {Object.values(currPlan).map((planItem: PlanItem, index) => (
        <Heading size="7" key={index}>
          {planItem.icon}
        </Heading>
      ))}
    </Flex>
  );
};

export default GroceriesPage;
