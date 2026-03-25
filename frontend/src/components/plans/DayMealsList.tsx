import DayNameCard from "@components/DayNameCard";
import {DayMeals, Meal} from "@hooks/plans";
import {Box, Flex} from "@radix-ui/themes";
import PlanMealRow from "@components/plans/PlanMealRow";
import {useUserDispatch} from "@hooks/user";

const DayMealsList = ({
  day,
  today,
  dayName,
  items,
}: {
  day: number;
  today: boolean;
  dayName: string;
  items: DayMeals;
}) => {
  const dispatch = useUserDispatch();
  return (
    <Box key={day}>
      <DayNameCard
        today={today}
        dayName={dayName}
        onPlusClick={() => {
          dispatch({
            action: "ADD_MEAL",
            id: "",
            meal: {
              description: "",
              weekDay: day,
              icon: "🍕",
            },
          });
        }}
      />
      <DayItemsList day={day} items={items} />
    </Box>
  );
};

const DayItemsList = ({items, day}) => (
  <Flex direction="column" px="13px" my="10px" mb="15px">
    {Object.entries(items).map(([id, item]: [string, Meal]) => (
      <PlanMealRow
        key={id}
        day={day}
        id={id}
        icon={item.icon}
        description={item.description}
      />
    ))}
  </Flex>
);

export default DayMealsList;
