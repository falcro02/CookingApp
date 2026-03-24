import useAppearance from "@hooks/appearance";
import {Popover, Button, Text} from "@radix-ui/themes";
import EmojiPicker, {Theme, Categories} from "emoji-picker-react";

const EmojiSlot = ({disabled, icon, onEmojiClick}) => {
  const {appearance} = useAppearance();

  return (
    <Popover.Root>
      <Popover.Trigger>
        <Button variant="ghost" disabled={disabled}>
          <Text size="7">{icon}</Text>
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <EmojiPicker
          theme={appearance == "light" ? Theme.LIGHT : Theme.DARK}
          searchDisabled={true}
          skinTonesDisabled={true}
          categories={[{category: Categories.FOOD_DRINK, name: "Food & Drink"}]}
          previewConfig={{showPreview: false}}
          onEmojiClick={onEmojiClick}
        />
      </Popover.Content>
    </Popover.Root>
  );
};

export default EmojiSlot;
