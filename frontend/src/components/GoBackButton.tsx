import usePage from "@hooks/page";
import {ArrowLeftIcon} from "@radix-ui/react-icons";
import {Box, Flex, Link} from "@radix-ui/themes";
import {Link as RouterLink} from "react-router-dom";

const GoBackButton = ({onClick}: {onClick?: () => void}) => {
  const {currPage, updatePage} = usePage();
  const dir = currPage.slice(0, currPage.lastIndexOf("/"));

  return (
    <Link
      asChild
      mt="2"
      mb="4"
      onClick={() => {
        updatePage(dir);
        if (onClick) onClick();
      }}
    >
      <RouterLink to={dir}>
        <Flex>
          <Box m="2px">
            <ArrowLeftIcon />
          </Box>
          Back
        </Flex>
      </RouterLink>
    </Link>
  );
};

export default GoBackButton;
