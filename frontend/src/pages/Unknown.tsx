import { ArrowRightIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import { Callout, Text, Strong, Box, Flex, Button, Link } from "@radix-ui/themes";

const UnknownPage = ({ setCurrentPage }) => (
    <Callout.Root>
        <Callout.Icon>
            <CrossCircledIcon />
        </Callout.Icon>
        <Callout.Text>
            <Flex>
                <Strong>Unknown page</Strong>
                <Box px="2" mt="3px"> <ArrowRightIcon /> </Box>
                Go back to the
                <Button ml="1" variant="ghost" onClick={() => setCurrentPage("groceries")} style={{
                    background: "none",
                    textDecoration: "underline",
                    cursor: "var(--cursor-link)"
                }}>
                    home page
                </Button>.
            </Flex>
        </Callout.Text >
    </Callout.Root >)

export default UnknownPage

