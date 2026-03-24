import {PlusIcon} from "@radix-ui/react-icons";
import {Card, Flex, Heading, Box, IconButton} from "@radix-ui/themes";

const DayNameCard = ({dayName, today, onPlusClick}) => (
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
      <AddItemButton onClick={onPlusClick} />
    </Flex>
  </Card>
);

const AddItemButton = ({onClick}) => {
  return (
    <Flex justify="center">
      <IconButton variant="ghost" radius="full" onClick={onClick}>
        <PlusIcon height="14" width="14" />
      </IconButton>
    </Flex>
  );
};

export default DayNameCard;
