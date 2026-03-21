import {getGroceries} from "@api/groceries";
import useUser, {useUserDispatch} from "@hooks/user";
import {Box, Card, Flex, Spinner, Separator} from "@radix-ui/themes";
import {useState, useCallback, useEffect, useMemo} from "react";
import DayList from "@components/groceries/DayList";
import ClearAndCheckButtons from "@components/groceries/ClearAndCheckButtons";
import GroceriesByDay from "@hooks/groceries";

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

const ShoppingList = () => (
  <Card asChild my="4">
    <Box width="100%" p="20px">
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

  return (
    <Box width="100%">
      {Object.keys(DAY_NAMES)
        .map((i) => (+i + TODAY) % 7)
        .map((day: number) => (
          <DayList
            key={day}
            day={day}
            today={day == TODAY}
            dayName={DAY_NAMES[day]}
            items={groceriesByDay[day] ?? {}}
          />
        ))}
      <Separator size="4" />
      <ClearAndCheckButtons />
    </Box>
  );
};

export default ShoppingList;
