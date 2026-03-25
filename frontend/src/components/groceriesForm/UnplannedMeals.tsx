import DayNameCard from "@components/DayNameCard";
import {Cross2Icon} from "@radix-ui/react-icons";
import {Box, Card, Flex, IconButton, TextField} from "@radix-ui/themes";
import {useState} from "react";
import {v4 as uuid} from "uuid";

const UnplannedMeals = ({onValueChange}) => {
  const [items, setItems] = useState<{[id: string]: string}>({});

  const delItem = (id: string) => {
    const {[id]: _, ...itemsLeft} = items;
    setItems(itemsLeft);
  };

  const editItems = (newDict: {[id: string]: string}) => {
    setItems(newDict);
    onValueChange(Object.values(newDict).filter((n) => n !== ""));
  };

  return (
    <Box width="100%">
      <Card>
        <DayNameCard
          dayName="Unplanned meals"
          today={false}
          onPlusClick={() => {
            if (Object.values(items).includes("")) return;
            editItems({...items, [uuid()]: ""});
          }}
        />
        <Flex direction="column" gap="2" px="13px" mt="10px" mb="4px">
          {Object.entries(items).map(([id, meal]) => (
            <Flex
              key={id}
              direction="row"
              gap="4"
              justify="start"
              align="center"
            >
              <ExtraMealRow
                id={id}
                description={meal}
                onNewValue={(newVal: string) => {
                  if (newVal === "") {
                    delItem(id);
                    return;
                  }
                  editItems({...items, [id]: newVal});
                }}
                onDelete={() => delItem(id)}
              />
            </Flex>
          ))}
        </Flex>
      </Card>
    </Box>
  );
};

const ExtraMealRow = ({id, description, onNewValue, onDelete}) => {
  return (
    <>
      <Box width="100%" height="24px">
        <TextField.Root
          id={id}
          placeholder="New item"
          size="1"
          defaultValue={description}
          variant="soft"
          onBlur={(e) => {
            const newVal = e.target.value;
            onNewValue(newVal);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur();
          }}
          style={{
            background: "transparent",
          }}
        ></TextField.Root>
      </Box>

      <IconButton variant="ghost" radius="full" onClick={onDelete}>
        <Cross2Icon height="12" width="12" />
      </IconButton>
    </>
  );
};

export default UnplannedMeals;
