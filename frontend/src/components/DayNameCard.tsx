import {PlusIcon} from "@radix-ui/react-icons";
import {Card, Flex, Heading, IconButton} from "@radix-ui/themes";

export interface TitleCardProps {
  name: string;
  today?: boolean;
  onPlusClick: () => void;
}

const TitleCard = ({name, today = false, onPlusClick}: TitleCardProps) => (
  <Card>
    <Flex direction="row" justify="between" align="center">
      <Flex direction="row" width="100%">
        <Heading size="2" trim="both">
          {name}
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

export default TitleCard;
