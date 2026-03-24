import {useUserDispatch} from "@hooks/user";
import {Box, Flex} from "@radix-ui/themes";
import GroceryItemCheckbox from "./GroceryItemCheckbox";
import {Item, DayItems} from "@hooks/groceries";
import DayNameCard from "@components/DayNameCard";

const DayGroceriesList = ({
  day,
  today,
  dayName,
  items,
}: {
  day: number;
  today: boolean;
  dayName: string;
  items: DayItems;
}) => {
  const dispatch = useUserDispatch();
  return (
    <Box key={day}>
      <DayNameCard
        today={today}
        dayName={dayName}
        onPlusClick={() => {
          dispatch({
            action: "ADD_GROCERY_ITEM",
            id: "",
            item: {
              description: "",
              weekDay: day,
              checked: false,
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
    {Object.entries(items).map(([id, item]: [string, Item]) => (
      <GroceryItemCheckbox
        key={id}
        day={day}
        id={id}
        checked={item.checked}
        description={item.description}
      />
    ))}
  </Flex>
);

export default DayGroceriesList;
