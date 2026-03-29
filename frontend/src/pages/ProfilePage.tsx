import {getPreferences} from "@api/preferences";
import PreferencesFields from "@components/profile/PreferencesFields";
import useAuth from "@hooks/auth";
import useUser, {useUserDispatch} from "@hooks/user";
import {Button, Flex, Separator, Text, Heading} from "@radix-ui/themes";
import {fetchUserAttributes} from "aws-amplify/auth";
import {useEffect, useState} from "react";

const ProfilePage = () => {
  const {user, signOut} = useAuth();
  const dispatch = useUserDispatch();
  const {preferences} = useUser();
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (preferences !== undefined) return;
    getPreferences().then((got) => {
      dispatch({
        action: "SET_PREFERENCES",
        preferences: got.preferences,
      });
    });
  }, [preferences, dispatch]);

  useEffect(() => {
    const getUserEmail = async () => {
      if (import.meta.env.DEV) setEmail("dev.mode@mail.com");
      else
        try {
          const attributes = await fetchUserAttributes();
          setEmail(attributes.email);
        } catch (err) {
          console.error(err);
        }
    };
    getUserEmail();
  }, []);

  return (
    <>
      <Heading mb="6">Preferences</Heading>
      <PreferencesFields />
      <Separator size="4" mb="4" mt="8" />
      <Flex width="100%" justify="between" align="center" p="5" px="8">
        <Text color="gray" size="2" align="left">
          {email || user.username || "Logged in"}
        </Text>
        <Button onClick={() => signOut()}>Sign out</Button>
      </Flex>
      <Flex width="100%" justify="center" align="end" height="10vh">
        <Text color="gray" size="1">
          {user.userId}
        </Text>
      </Flex>
    </>
  );
};

export default ProfilePage;
