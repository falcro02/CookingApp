import {Checkbox, Text} from "@radix-ui/themes";

const GroceryItemCheckbox = ({label}: {label: string}) => {
  return (
    <Text as="label" size="2">
      <Checkbox mr="1" />
      {label}
    </Text>
  );
};

export default GroceryItemCheckbox;
