import usePage from "@hooks/page";
import {ArrowLeftIcon} from "@radix-ui/react-icons";
import {Box, Flex, Link} from "@radix-ui/themes";

const GoBackButton = () => {
  const {currPage} = usePage();
  const dir = currPage.slice(0, currPage.lastIndexOf("/"));

  return (
    <Link href={dir} my="2">
      <Flex>
        <Box m="2px">
          <ArrowLeftIcon />
        </Box>
        Back
      </Flex>
    </Link>
  );
};

export default GoBackButton;
