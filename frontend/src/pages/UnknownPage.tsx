import {ArrowRightIcon, CrossCircledIcon} from "@radix-ui/react-icons";
import {Callout, Strong, Box, Flex, Link} from "@radix-ui/themes";

const UnknownPage = () => (
  <Callout.Root>
    <Callout.Icon>
      <CrossCircledIcon />
    </Callout.Icon>
    <Callout.Text>
      <Flex gap="1">
        <Strong>Unknown page</Strong>
        <Box mt="3px">
          <ArrowRightIcon />
        </Box>
        Go back to the <Link href="/">home page</Link>.
      </Flex>
    </Callout.Text>
  </Callout.Root>
);

export default UnknownPage;
