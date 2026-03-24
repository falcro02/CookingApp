import {FormFieldsRequest} from "@api/groceries";
import {getPlans} from "@api/plans";
import GoBackButton from "@components/GoBackButton";
import DaysSelector from "@components/groceriesForm/DaysSelector";
import UnplannedMeals from "@components/groceriesForm/UnplannedMeals";
import PlanReviewer from "@components/groceriesForm/PlanReviewer";
import usePage from "@hooks/page";
import useUser, {useUserDispatch} from "@hooks/user";
import {Pencil1Icon} from "@radix-ui/react-icons";
import {Button, Flex, Heading} from "@radix-ui/themes";
import {useEffect} from "react";

const FillGroceriesPage = () => {
  const dispatch = useUserDispatch();
  const {plans} = useUser();
  const {updatePage} = usePage();

  useEffect(() => {
    if (plans !== undefined) return;
    getPlans().then((got) => {
      dispatch({
        action: "SET_PLANS",
        plans: got.plans,
        current: got.current,
      });
    });
  }, [plans, dispatch]);

  // This is the temporary storage for all the form information before calling
  // the generate groceries api
  let formFields: FormFieldsRequest = {
    days: [],
    plan: plans?.current ?? 1,
    unplanned: [],
    extra: "",
    replace: false,
  };

  return (
    <>
      <Heading>Fill groceries with AI</Heading>
      <GoBackButton />
      <Heading mb="4" size="3">
        When can you go shopping?
      </Heading>
      <DaysSelector
        onValueChange={(newVal) => {
          formFields.days = newVal;
        }}
      />
      <Flex
        mt="8"
        mb="4"
        direction="row"
        justify="between"
        align="end"
        width="100%"
      >
        <Heading size="3">Choose one of your plans</Heading>
        <Button
          variant="ghost"
          mr="8px"
          style={{cursor: "var(--cursor-link)"}}
          onClick={() => updatePage("/groceries/fill/plans")}
        >
          <Pencil1Icon />
          Edit plans
        </Button>
      </Flex>
      <PlanReviewer />
      <Heading mt="8" mb="4" size="3">
        Other details
      </Heading>
      <UnplannedMeals
        onValueChange={(newVal: string[]) => {
          formFields.unplanned = newVal;
        }}
      />
      {/* TODO: set curr plan before sending */}
    </>
  );
};

export default FillGroceriesPage;
