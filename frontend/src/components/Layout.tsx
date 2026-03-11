import FloatFoot from "@components/FloatFoot";
import FloatHead from "@components/FloatHead";
import {Container, Flex} from "@radix-ui/themes";
import FloatHeadCompact from "@components/FloatHeadCompact";
import useWindowWidth from "@hooks/window";

const Layout = ({children}) => {
  const width = useWindowWidth();
  return (
    <>
      <main>
        <Container size="1" align="center" py="4vh">
          <Flex overflowX="hidden" align="start" direction="column">
            {children}
          </Flex>
        </Container>
      </main>
      <header>{width < 1000 ? <FloatHeadCompact /> : <FloatHead />}</header>
      <footer>
        <FloatFoot />
      </footer>
    </>
  );
};

export default Layout;
