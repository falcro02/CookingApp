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
        defaultValue={curr}
        size="3"
        onValueChange={(sel) => {
          setCurrentPlan({current: +sel}).then(() => {
            dispatch({action: "SET_CURRENT_PLAN", current: +sel});
          });
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <SegmentedControl.Item key={i} value={i.toString()}>
            <Box width="25%">{!plans?.plans[i] ? <PlusIcon /> : i}</Box>
          </SegmentedControl.Item>
        ))}
      </SegmentedControl.Root>
    </Flex>
  );
};

export default CurrentPlanSelector;
