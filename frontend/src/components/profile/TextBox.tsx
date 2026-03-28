import {Box, TextArea} from "@radix-ui/themes";

const TextBox = ({id, value, onNewValue}) => (
  <Box width="100%">
    <TextArea
      id={id}
      defaultValue={value}
      placeholder="Preferences..."
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

export default TextBox;
