import useUser from "@hooks/user";
import {Card, Text, Box, Flex, Spinner} from "@radix-ui/themes";

const PlanDisplay = () => (
  <Card asChild my="4">
    <Box width="100%" p="20px">
      <Flex direction="column" align="center">
        <PlansContent />
      </Flex>
    </Box>
  </Card>
);

const PlansContent = () => {
  const {plans} = useUser();
  if (!plans) return <Spinner />;

  // Find the current plan selected
  const currPlan = plans.plans[plans.current];
  if (!currPlan || Object.keys(currPlan).length === 0)
    return "Tap to create a plan";

  return (
    <Flex direction="column" gap="2" align="start" width="100%">
      {Object.entries(currPlan).map(([id, item]) => (
        <Flex gap="2" key={id}>
          <Text size="5">{item.icon}</Text>
          <Text>{item.description}</Text>
        </Flex>
      ))}
    </Flex>
  );
};

export default PlanDisplay;
