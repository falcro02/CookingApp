import usePage from "@hooks/page";
import useUser from "@hooks/user";
import {Button, Card, Box, Flex, Spinner, Heading} from "@radix-ui/themes";

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
  const {plans} = useUser();
  if (!plans) return <Spinner />;

  // Find the current plan selected
  const currPlan = plans.plans[plans.current];
  if (!currPlan || Object.keys(currPlan).length === 0)
    return "Tap to create a plan";

  return (
    <Flex
      justify={Object.keys(currPlan).length == 1 ? "center" : "between"}
      width="80%"
    >
      {Object.entries(currPlan).map(([id, item]) => (
        <Heading size="7" key={id}>
          {item.icon}
        </Heading>
      ))}
    </Flex>
  );
};

export default TodaysMenu;
