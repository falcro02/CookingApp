import useAuth from "@hooks/auth";
import {Button, Heading} from "@radix-ui/themes";

const ProfilePage = () => {
  const {user, signOut} = useAuth();
  return (
    <>
      <Heading>Profile Page</Heading>
      {user.username}
      <Button onClick={() => signOut()}>Sign out</Button>
    </>
  );
};

export default ProfilePage;
