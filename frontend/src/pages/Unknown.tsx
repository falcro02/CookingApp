import { usePage } from "@context/page";
import { ArrowRightIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import { Callout, Strong, Box, Flex, Button } from "@radix-ui/themes";

const UnknownPage = () => {
    const { updatePage } = usePage()
    return (
        <Callout.Root>
            <Callout.Icon>
                <CrossCircledIcon />
            </Callout.Icon>
            <Callout.Text>
                <Flex>
                    <Strong>Unknown page</Strong>
                    <Box px="2" mt="3px"> <ArrowRightIcon /> </Box>
                    Go back to the
                    <Button ml="1" variant="ghost" onClick={() => updatePage("/")} style={{
                        background: "none",
                        textDecoration: "underline",
                        cursor: "var(--cursor-link)"
                    }}>
                        home page
                    </Button>.
                </Flex>
            </Callout.Text >
        </Callout.Root >
    )
}

export default UnknownPage

