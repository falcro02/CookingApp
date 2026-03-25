import {setCurrentPlan} from "@api/plans";
import useUser, {useUserDispatch} from "@hooks/user";
import {PlusIcon} from "@radix-ui/react-icons";
import {Box, Flex, SegmentedControl, Spinner} from "@radix-ui/themes";

const CurrentPlanSelector = () => {
  const dispatch = useUserDispatch();
  const {plans} = useUser();
  const curr = plans?.current.toString();

  if (!curr)
    return (
      <Flex justify="center" width="100%" mt="8px">
        <Spinner size="3" />
      </Flex>
    );

  return (
    <Flex justify="center" width="100%" asChild>
      <SegmentedControl.Root
        value={curr}
        size="3"
        onValueChange={(sel) => {
          // If plan is empty set current plan only locally,
          // else, send set current plan api and set also locally.
          //
          // If plan is empty, then the set plan current api will be called
          // when an element is added to it.

          const currPlanLen = Object.keys(plans.plans[sel] ?? {}).length;
          const d = () => {
            dispatch({action: "SET_CURRENT_PLAN", current: +sel});
          };
          if (currPlanLen !== 0) setCurrentPlan({current: +sel}).then(d);
          else d();
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <SegmentedControl.Item key={i} value={i.toString()}>
            <Box width="25%">
              {Object.keys(plans?.plans[i] ?? {}).length === 0 &&
              i !== (plans?.current ?? 1) ? (
                <PlusIcon />
              ) : (
                i
              )}
            </Box>
          </SegmentedControl.Item>
        ))}
      </SegmentedControl.Root>
    </Flex>
  );
};

export default CurrentPlanSelector;
