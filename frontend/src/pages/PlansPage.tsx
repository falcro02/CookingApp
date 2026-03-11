import usePage from "@hooks/page";
import {ArrowLeftIcon} from "@radix-ui/react-icons";
import {Box, Flex, Heading, Link} from "@radix-ui/themes";

const PlansPage = () => {
  const {currPage} = usePage();
  const dir = currPage.slice(0, currPage.lastIndexOf("/"));

  return (
    <>
      <Heading>Plans Page</Heading>
      <Link href={dir} my="2">
        <Flex>
          <Box m="2px">
            <ArrowLeftIcon />
          </Box>
          Back
        </Flex>
      </Link>
    </>
  );
};

export default PlansPage;
