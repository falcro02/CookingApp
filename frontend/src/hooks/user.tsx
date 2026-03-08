import {createContext, useContext, useMemo} from "react";
import {GroceriesState, Groceries} from "@shared/types/groceries";
import {IdeasState} from "@shared/types/ideas";
import {IngredientsState} from "@shared/types/ingredients";
import {Plans, PlansState} from "@shared/types/plans";
import {PreferencesState} from "@shared/types/preferences";

// ===== USER REDUCER ===== //

interface User {
  groceries: GroceriesState;
  plans: PlansState;
  ingredients: IngredientsState;
  ideas: IdeasState;
  preferences: PreferencesState;
}

type UserAction =
  | {action: "SET_PLANS"; plans: Plans; current: number}
  | {action: "SET_CURRENT_PLAN"; current: number}
  | {action: "SET_GROCERIES"; groceries: Groceries};

export function userReducer(
  state: User | null,
  action: UserAction,
): User | null {
  switch (action.action) {
    case "SET_PLANS":
      return {
        ...state,
        plans: {
          ...state?.plans,
          plans: action.plans,
          current: action.current,
        },
      };
    case "SET_CURRENT_PLAN":
      return {
        ...state,
        plans: {
          ...state?.plans,
          current: action.current,
        },
      };
    case "SET_GROCERIES":
      return {
        ...state,
        groceries: {
          ...state?.groceries,
          groceries: action.groceries,
        },
      };
  }
}

// ===== USER CONTEXT ===== //

interface UserContextType {
  user: User | null;
  dispatch: React.Dispatch<UserAction>;
}

export const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be in UserProvider");

  const u = context.user;
  return useMemo(
    () => ({
      groceries: u?.groceries,
      plans: u?.plans,
      ingredients: u?.ingredients,
      ideas: u?.ideas,
      preferences: u?.preferences,
    }),
    [u?.groceries, u?.plans, u?.ingredients, u?.ideas, u?.preferences],
  );
};

export const useUserDispatch = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be in UserProvider");

  const d = context.dispatch;
  if (!d) throw new Error("dispatch is not set");
  return d;
};

export default useUser;
