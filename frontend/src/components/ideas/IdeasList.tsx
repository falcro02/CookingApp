import useUser from "@hooks/user";
import {Box, Card, Flex, Spinner, Text} from "@radix-ui/themes";
import {IdeaItem} from "@shared/types/ideas";

const IdeasList = () => {
  const {ideas} = useUser();

  if (!ideas) return <Spinner size="3" />;

  return (
    <Flex direction="column" width="100%" gap="4">
      {ideas?.ideas.map((idea, idx) => (
        <IdeaCard key={idx} idea={idea} />
      ))}
    </Flex>
  );
};

const IdeaCard = ({idea}: {idea: IdeaItem}) => {
  return (
    <Box width="100%">
      <Card>
        <Card>
          <Flex align="center" direction="row" width="100%" gap="4" px="1">
            <Text size="7" trim="both">
              {idea.icon}
            </Text>
            <Text weight="bold">{idea.name}</Text>
          </Flex>
        </Card>
        <Box p="2" pt="4">
          <Text as="p" trim="both" size="2">
            {idea.story}
          </Text>
        </Box>
      </Card>
    </Box>
  );
};

export default IdeasList;
