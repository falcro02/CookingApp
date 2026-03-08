import {getGroceries} from "@api/groceries";
import useUser, {useUserDispatch} from "@hooks/user";
import {Box, Card, Heading, Flex, Spinner} from "@radix-ui/themes";
import {GroceryItem} from "@shared/types/groceries";
import {useState, useCallback, useEffect, useMemo} from "react";
import GroceryItemCheckbox from "@components/GroceryItemCheckbox";

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

const ShopingLists = () => {
  const dispatch = useUserDispatch();
  const {groceries} = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [gotError, setGotError] = useState(false);

  // Generate a (memoized) support object used for easily display grocery items
  // on the different week day lists
  const groceriesByDay = useMemo<GroceriesByDay>(() => {
    if (!groceries) return {};
    const grouped: GroceriesByDay = {};
    Object.keys(DAY_NAMES).forEach((weekDay: string) => {
      grouped[(+weekDay + 6) % 7] = {};
    });
    Object.entries(groceries.groceries).forEach(
      ([id, item]: [string, GroceryItem]) => {
        const dayDict = grouped[item.weekDay];
        dayDict[id] = {
          description: item.description,
          checked: item.checked,
        };
        grouped[item.weekDay] = dayDict;
      },
    );
    return grouped;
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

  if (gotError) return "ERROR";
  if (isLoading) return <Spinner m="10px" />;
  if (!groceries || !groceriesByDay) return;
  if (Object.keys(groceries.groceries).length === 0) return;

  return (
    <Card asChild my="4">
      <Box width="100%" px="20px" py="20px">
        {[0, 1, 2, 3, 4, 5, 6]
          .map((i) => (i + TODAY) % 7)
          .map((day: number) => (
            <DayList
              key={day}
              day={day}
              items={groceriesByDay[day]}
              today={day == TODAY}
            />
          ))}
      </Box>
    </Card>
  );
};

interface DayListProps {
  day: number;
  items: DayItems;
  today: boolean;
}

const DayList = ({day, items, today}: DayListProps) => {
  return (
    <>
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
      <Flex direction="column" px="4" my="10px" mb="15px" gap="2">
        {Object.entries(items).map(([id, item]: [string, Item]) => (
          <GroceryItemCheckbox key={id} label={item.description} />
        ))}
      </Flex>
    </>
  );
};

export default ShopingLists;
