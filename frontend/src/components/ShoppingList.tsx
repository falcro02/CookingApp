import {getGroceries} from "@api/groceries";
import useUser, {useUserDispatch} from "@hooks/user";
import {Box, Card, Heading, Flex, Spinner, IconButton} from "@radix-ui/themes";
import {useState, useCallback, useEffect, useMemo} from "react";
import GroceryItemCheckbox from "@components/GroceryItemCheckbox";
import {PlusIcon} from "@radix-ui/react-icons";

const TODAY: number = (new Date().getDay() + 6) % 7;

const DAY_NAMES = {
  0: "Monday",
  1: "Tuesday",
  2: "Wednesday",
  3: "Thursday",
  4: "Friday",
  5: "Saturday",
  6: "Sunday",
};

interface GroceriesByDay {
  [weekDay: number]: DayItems;
}

interface DayItems {
  [id: string]: Item;
}

interface Item {
  description: string;
  checked: boolean;
}

const ShoppingList = () => (
  <Card asChild my="4">
    <Box width="100%" px="20px" py="20px">
      <Flex direction="column" align="center">
        <ShoppingListContent />
      </Flex>
    </Box>
  </Card>
);

const ShoppingListContent = () => {
  const dispatch = useUserDispatch();
  const {groceries} = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [gotError, setGotError] = useState(false);

  // Generate a (memoized) support object used for easily display grocery items
  // on the different week day lists
  const groceriesByDay = useMemo<GroceriesByDay>(() => {
    if (!groceries?.groceries) return {};
    return Object.entries(groceries.groceries).reduce((acc, [id, item]) => {
      const day = item.weekDay;
      if (!acc[day]) acc[day] = {};
      acc[day][id] = {
        description: item.description,
        checked: item.checked,
      };
      return acc;
    }, {} as GroceriesByDay);
  }, [groceries]);

  // Prepare a callback function to call the get groceries endpoint and update
  // the local representation of those
  const loadGroceries = useCallback(async () => {
    setIsLoading(true);
    setGotError(false);
    try {
      const got = await getGroceries();
      dispatch({
        action: "SET_GROCERIES",
        groceries: got.groceries,
      });
    } catch {
      setGotError(true);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  // If it is the first time opening the app (groceries were not populated
  // before) load groceries (calling endpoint and populating representation)
  useEffect(() => {
    if (groceries !== undefined) return;
    loadGroceries();
  }, [groceries, loadGroceries]);

  if (gotError) return "Error";
  if (isLoading) return <Spinner m="10px" />;
  if (!groceries || !groceriesByDay) return "Waiting for groceries to load";
  if (Object.keys(groceries.groceries).length === 0) return "No groceries";

  return (
    <Box width="100%">
      {Object.keys(DAY_NAMES)
        .map((i) => (+i + TODAY) % 7)
        .map((day: number) => (
          <Box key={day}>
            <DayNameCard day={day} today={day == TODAY} />
            <DayList day={day} items={groceriesByDay[day] ?? {}} />
          </Box>
        ))}
    </Box>
  );
};

const DayNameCard = ({day, today}) => (
  <Card>
    <Flex direction="row" align="center">
      <Heading size="2" trim="both">
        {DAY_NAMES[day]}
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
    </Flex>
  </Card>
);

const DayList = ({items, day}) => {
  const dispatch = useUserDispatch();
  return (
    <Flex direction="column" px="4" my="10px" mb="15px">
      {Object.entries(items).map(([id, item]: [string, Item]) => (
        <GroceryItemCheckbox
          key={id}
          day={day}
          id={id}
          checked={item.checked}
          description={item.description}
        />
      ))}
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
          <PlusIcon height="18" width="18" />
        </IconButton>
      </Flex>
    </Flex>
  );
};

export default ShoppingList;
