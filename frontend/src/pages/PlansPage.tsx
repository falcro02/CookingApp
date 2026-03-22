import {getPlans} from "@api/plans";
import GoBackButton from "@components/GoBackButton";
import CurrentPlanSelector from "@components/plans/CurrentPlanSelector";
import PlanDisplay from "@components/plans/PlanDisplay";
import useUser, {useUserDispatch} from "@hooks/user";
import {Heading} from "@radix-ui/themes";
import {useEffect} from "react";

const PlansPage = () => {
  const dispatch = useUserDispatch();
  const {plans} = useUser();

  useEffect(() => {
    if (plans !== undefined) return;
    getPlans().then((got) => {
      dispatch({
        action: "SET_PLANS",
        plans: got.plans,
        current: got.current,
      });
    });
  }, [plans, dispatch]);

  return (
    <>
      <Heading>Meal plans</Heading>
      <GoBackButton />
      <Heading mb="4" size="3">
        Selected plan
      </Heading>
      <CurrentPlanSelector />
      <Heading mt="6" size="3">
        Plan details
      </Heading>
      <PlanDisplay />
    </>
  );
};

export default PlansPage;
