import Layout from "@components/Layout";
import useAppearance from "@hooks/appearance";
import FillGroceriesPage from "@pages/FillGroceriesPage";
import IngredientsPage from "@pages/IngredientsPage";
import GroceriesPage from "@pages/GroceriesPage";
import IdeasPage from "@pages/IdeasPage";
import PlansPage from "@pages/PlansPage";
import ProfilePage from "@pages/ProfilePage";
import UnknownPage from "@pages/UnknownPage";
import {Theme} from "@radix-ui/themes";
import {Route, Routes} from "react-router-dom";

function App() {
  const {appearance} = useAppearance();
  return (
    <Theme
      accentColor="ruby"
      grayColor="sage"
      radius="large"
      appearance={appearance}
    >
      <Layout>
        <Routes>
          <Route path="/" element={<GroceriesPage />} />
          <Route path="/groceries/fill/plans" element={<PlansPage />} />
          <Route path="/groceries/fill" element={<FillGroceriesPage />} />
          <Route path="/groceries/plans" element={<PlansPage />} />
          <Route path="/groceries" element={<GroceriesPage />} />
          <Route path="/ingredients/ideas" element={<IdeasPage />} />
          <Route path="/ingredients" element={<IngredientsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<UnknownPage />} />
        </Routes>
      </Layout>
    </Theme>
  );
}

export default App;
