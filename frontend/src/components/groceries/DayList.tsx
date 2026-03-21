import {useUserDispatch} from "@hooks/user";
import {PlusIcon} from "@radix-ui/react-icons";
import {Box, Card, Flex, Heading, IconButton} from "@radix-ui/themes";
import GroceryItemCheckbox from "./GroceryItemCheckbox";
import {Item, DayItems} from "@hooks/groceries";

const DayList = ({
  day,
  today,
  dayName,
  items,
}: {
  day: number;
  today: boolean;
  dayName: string;
  items: DayItems;
}) => (
  <Box key={day}>
    <DayNameCard day={day} today={today} dayName={dayName} />
    <DayItemsList day={day} items={items} />
  </Box>
);

const DayNameCard = ({day, dayName, today}) => (
  <Card>
    <Flex direction="row" align="center">
      <Heading size="2" trim="both">
        {dayName}
      </Heading>
      {today && (
        <Heading
          size="2"
          trim="both"
          ml="2"
          weight="light"
          style={{color: "var(--gray-9)"}}
        >
          (today)
        </Heading>
      )}
      <Box width="100%" />
      <AddItemButton day={day} />
    </Flex>
  </Card>
);

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

const AddItemButton = ({day}) => {
  const dispatch = useUserDispatch();
  return (
    <Flex justify="center">
      <IconButton
        variant="ghost"
        radius="full"
        onClick={() => {
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
      >
        <PlusIcon height="14" width="14" />
      </IconButton>
    </Flex>
  );
};

export default DayList;
