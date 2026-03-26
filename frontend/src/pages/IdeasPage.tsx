import {Separator, Heading, Flex, Text} from "@radix-ui/themes";
import {useUserDispatch, useUser} from "@hooks/user";
import {useEffect} from "react";
import {getIdeas} from "@api/ideas";
import GoBackButton from "@components/GoBackButton";
import IdeasList from "@components/ideas/IdeasList";
import ClearButton from "@components/ideas/ClearButton";
import GenerateIdeasButton from "@components/ideas/GenerateIdeasButton";

const IdeasPage = () => {
  const dispatch = useUserDispatch();
  const {ideas} = useUser();

  useEffect(() => {
    if (ideas !== undefined) return;
    getIdeas().then((got) => {
      dispatch({
        action: "SET_IDEAS",
        ideas: got.ideas,
      });
    });
  }, [ideas, dispatch]);

  const hasIdeas = (ideas?.ideas ?? []).length !== 0;

  return (
    <>
      <Heading>Get ideas with AI</Heading>
      <GoBackButton />
      <Flex width="100%" justify="center" my="6">
        <GenerateIdeasButton />
      </Flex>
      <Heading size="3" mb="4">
        Generated ideas
      </Heading>
      {hasIdeas ? (
        <>
          <IdeasList />
          <Separator size="4" mt="4" />
          <ClearButton />
        </>
      ) : (
        <Flex width="100%" justify="center">
          <Text size="1" color="gray">
            Ideas not generated yet
          </Text>
        </Flex>
      )}
    </>
  );
};

export default IdeasPage;
