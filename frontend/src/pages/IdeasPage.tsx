import {Heading} from "@radix-ui/themes";
import {useUserDispatch, useUser} from "@hooks/user";
import {useEffect} from "react";
import {getIdeas} from "@api/ideas";
import GoBackButton from "@components/GoBackButton";

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

  return (
    <>
      <Heading>Get ideas with AI</Heading>
      <GoBackButton />
    </>
  );
};

export default IdeasPage;
