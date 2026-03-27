import {patchPreferences} from "@api/preferences";
import {Heading} from "@radix-ui/themes";
import TextBox from "@components/profile/TextBox";
import useUser, {useUserDispatch} from "@hooks/user";

const PreferencesFields = () => {
  const dispatch = useUserDispatch();
  const {preferences} = useUser();

  return (
    <>
      <Heading mb="2" size="3">
        Dietary
      </Heading>
      <TextBox
        id="dietary"
        value={preferences?.preferences?.dietary ?? ""}
        onNewValue={(newVal: string) => {
          const p = {dietary: newVal};
          patchPreferences({preferences: p}).then(() => {
            dispatch({action: "EDIT_PREFERENCES", preferences: p});
          });
        }}
      />
      <Heading mb="2" mt="6" size="3">
        Allergies
      </Heading>
      <TextBox
        id="allergies"
        value={preferences?.preferences?.allergies ?? ""}
        onNewValue={(newVal: string) => {
          const p = {allergies: newVal};
          patchPreferences({preferences: p}).then(() => {
            dispatch({action: "EDIT_PREFERENCES", preferences: p});
          });
        }}
      />
      <Heading mb="2" mt="6" size="3">
        Disliked
      </Heading>
      <TextBox
        id="disliked"
        value={preferences?.preferences?.disliked ?? ""}
        onNewValue={(newVal: string) => {
          const p = {disliked: newVal};
          patchPreferences({preferences: p}).then(() => {
            dispatch({action: "EDIT_PREFERENCES", preferences: p});
          });
        }}
      />
    </>
  );
};

export default PreferencesFields;
