import {setCurrentPlan} from "@api/plans";
import useUser, {useUserDispatch} from "@hooks/user";
import {Box, Text, RadioCards} from "@radix-ui/themes";

const PlanReviewer = ({onValueChange}) => {
  const {plans} = useUser();
  const dispatch = useUserDispatch();

  const planIsEmpty = (planNr: number) => {
    return Object.keys(plans?.plans[planNr?.toString()] ?? {}).length === 0;
  };

  return (
    <Box width="100%">
      <RadioCards.Root
        columns="2"
        value={planIsEmpty(plans?.current) ? "" : plans?.current?.toString()}
        onValueChange={(newVal) => {
          onValueChange(+newVal);
          setCurrentPlan({current: +newVal}).then(() => {
            dispatch({action: "SET_CURRENT_PLAN", current: +newVal});
          });
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <RadioCards.Item
            key={i}
            value={i.toString()}
            disabled={planIsEmpty(i)}
          >
            <Text align="center" size="4" trim="both">
              {i}
            </Text>
          </RadioCards.Item>
        ))}
      </RadioCards.Root>
    </Box>
  );
};

export default PlanReviewer;
