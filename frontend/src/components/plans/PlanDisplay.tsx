import MealsByDay from "@hooks/plans";
import useUser from "@hooks/user";
import {DAY_NAMES, TODAY} from "@hooks/week";
import {Card, Box, Flex, Spinner, Separator} from "@radix-ui/themes";
import {useMemo} from "react";
import DayMealsList from "@components/plans/DayMealsList";
import DeletePlanButton from "@components/plans/DeletePlanButton";

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

  // Generate a (memoized) support object used for easily display current plan
  // items on the different week day lists
  const mealsByDay = useMemo<MealsByDay>(() => {
    const currPlan = plans?.plans[plans.current] ?? {};
    return Object.entries(currPlan).reduce((acc, [id, item]) => {
      const day = item.weekDay;
      if (!acc[day]) acc[day] = {};
      acc[day][id] = {
        description: item.description,
        icon: item.icon,
      };
      return acc;
    }, {} as MealsByDay);
  }, [plans]);

  if (!plans || !mealsByDay) return <Spinner />;

  return (
    <Box width="100%">
      {Object.keys(DAY_NAMES)
        .map((i) => (+i + TODAY) % 7)
        .map((day: number) => (
          <DayMealsList
            key={day}
            day={day}
            today={day == TODAY}
            dayName={DAY_NAMES[day]}
            items={mealsByDay[day] ?? {}}
          />
        ))}
      <Separator size="4" />
      <DeletePlanButton />
    </Box>
  );
};

export default PlanDisplay;
