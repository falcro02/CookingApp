import { CircleIcon } from "@radix-ui/react-icons";
import { Heading, Card, Flex, Box } from "@radix-ui/themes";

const GroceriesPage = () => (
    <>
        <Heading mb="4">Groceries list</Heading>
        <Heading size="3">Today's menu</Heading>
        <TodaysMenu />
    </>
)

const TodaysMenu = () => (
    <Card asChild my="4" width="100%" px="50px" py="20px">
        <Box>
            <Flex justify="between" width="100%" >
                <CircleIcon />
                <CircleIcon />
                <CircleIcon />
                <CircleIcon />
                <CircleIcon />
            </Flex>
        </Box>
    </Card>
);

export default GroceriesPage

