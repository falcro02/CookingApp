import {DAY_NAMES} from "@hooks/week";
import {Box, Button, Flex, Text} from "@radix-ui/themes";
import {useState} from "react";

const DaysSelector = ({
  onValueChange,
}: {
  onValueChange: (newVal: number[]) => void;
}) => {
  const [selected, setSelected] = useState<number[]>([]);

  return (
    <Flex
      direction="row"
      justify="between"
      width="100%"
      style={{
        borderRadius: "var(--radius-4)",
        overflow: "hidden",
      }}
    >
      {Object.entries(DAY_NAMES).map(([nr, dayName]) => (
        <DayToggle
          key={nr}
          dayName={dayName}
          selected={selected.includes(+nr)}
          onClick={() => {
            let newSelected: number[];
            if (selected.includes(+nr))
              newSelected = selected.filter((n) => n !== +nr);
            else newSelected = [...selected, +nr];
            setSelected(newSelected);

            onValueChange(newSelected);
          }}
        />
      ))}
    </Flex>
  );
};

const DayToggle = ({dayName, selected, onClick}) => {
  return (
    <Button
      variant={selected ? "solid" : "soft"}
      radius="none"
      onClick={onClick}
      asChild
    >
      <Box width={100 / 7 + "%"} asChild>
        <Text size="3">{dayName.substring(0, 3)}</Text>
      </Box>
    </Button>
  );
};

export default DaysSelector;
