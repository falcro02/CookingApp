import {Box, TextArea} from "@radix-ui/themes";

const ExtrasText = ({onNewValue}: {onNewValue: (newVal: string) => void}) => (
  <Box width="100%">
    <TextArea
      id="extras"
      m="1"
      mt="6"
      placeholder="Extras..."
      radius="full"
      resize="vertical"
      variant="soft"
      onBlur={(e) => {
        const newVal = e.target.value;
        onNewValue(newVal);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") e.currentTarget.blur();
      }}
    />
  </Box>
);

export default ExtrasText;
