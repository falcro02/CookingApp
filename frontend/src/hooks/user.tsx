import {createContext, Dispatch, useContext, useMemo} from "react";
import {GroceriesState, Groceries, GroceryItem} from "@shared/types/groceries";
import {IdeaItem, IdeasState} from "@shared/types/ideas";
import {
  IngredientItem,
  Ingredients,
  IngredientsState,
} from "@shared/types/ingredients";
import {PlanItem, Plans, PlansState} from "@shared/types/plans";
import {PreferencesState} from "@shared/types/preferences";

// ===== USER REDUCER ===== //

interface User {
  groceries: GroceriesState;
  plans: PlansState;
  ingredients: IngredientsState;
  ideas: IdeasState;
  preferences: PreferencesState;
}

export type UserAction =
  | {action: "SET_GROCERIES"; groceries: Groceries}
  | {action: "CLEAR_GROCERIES"}
  | {action: "CHECK_ALL_GROCERIES"; check: boolean}
  | {action: "CHECK_GROCERY_ITEM"; id: string; checked: boolean}
  | {action: "ADD_GROCERY_ITEM"; id: string; item: GroceryItem}
  | {action: "EDIT_GROCERY_ITEM"; id: string; item: Partial<GroceryItem>}
  | {action: "DELETE_GROCERY_ITEM"; id: string}
  | {action: "SET_PLANS"; plans: Plans; current: number}
  | {action: "SET_CURRENT_PLAN"; current: number}
  | {action: "DELETE_PLAN"}
  | {action: "ADD_MEAL"; id: string; meal: PlanItem}
  | {action: "DELETE_MEAL"; id: string}
  | {action: "EDIT_MEAL"; id: string; meal: Partial<PlanItem>}
  | {action: "SET_IDEAS"; ideas: IdeaItem[]}
  | {action: "CLEAR_IDEAS"}
  | {action: "SET_INGREDIENTS"; ingredients: Ingredients}
  | {action: "CLEAR_INGREDIENTS"}
  | {action: "ADD_INGREDIENT"; id: string; item: IngredientItem}
  | {action: "DELETE_INGREDIENT"; id: string}
  | {action: "EDIT_INGREDIENT"; id: string; item: Partial<IngredientItem>};

export function userReducer(
  state: User | null,
  action: UserAction,
): User | null {
  switch (action.action) {
    case "SET_GROCERIES":
      return {
        ...state,
        groceries: {
          ...state?.groceries,
          groceries: action.groceries,
        },
      };
    case "CLEAR_GROCERIES":
      return {
        ...state,
        groceries: {
          ...state?.groceries,
          groceries: {},
        },
      };
    case "CHECK_ALL_GROCERIES":
      return {
        ...state,
        groceries: {
          ...state?.groceries,
          groceries: Object.entries(state?.groceries?.groceries || {}).reduce(
            (acc, [id, item]) => {
              acc[id] = {...item, checked: action.check};
              return acc;
            },
            {} as Groceries,
          ),
        },
      };
    case "CHECK_GROCERY_ITEM": {
      const curr = state?.groceries?.groceries[action.id];
      if (!curr) return state;
      return {
        ...state,
        groceries: {
          ...state?.groceries,
          groceries: {
            ...state?.groceries?.groceries,
            [action.id]: {
              ...curr,
              checked: action.checked,
            },
          },
        },
      };
    }
    case "ADD_GROCERY_ITEM":
      return {
        ...state,
        groceries: {
          ...state?.groceries,
          groceries: {
            ...state?.groceries?.groceries,
            [action.id]: action.item,
          },
        },
      };
    case "EDIT_GROCERY_ITEM":
      return {
        ...state,
        groceries: {
          ...state?.groceries,
          groceries: {
            ...state?.groceries?.groceries,
            [action.id]: {
              ...state?.groceries?.groceries[action.id],
              ...action.item,
            },
          },
        },
      };
    case "DELETE_GROCERY_ITEM": {
      const {[action.id]: _, ...groceriesLeft} =
        state?.groceries?.groceries || {};
      return {
        ...state,
        groceries: {
          ...state?.groceries,
          groceries: groceriesLeft,
        },
      };
    }
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
    case "DELETE_PLAN": {
      const {[state?.plans?.current]: _, ...plansLeft} =
        state?.plans?.plans || {};
      return {
        ...state,
        plans: {
          ...state?.plans,
          plans: plansLeft,
        },
      };
    }
    case "ADD_MEAL":
      return {
        ...state,
        plans: {
          ...state?.plans,
          plans: {
            ...state?.plans?.plans,
            [state?.plans?.current ?? 1]: {
              ...state?.plans?.plans[state?.plans?.current ?? 1],
              [action.id]: action.meal,
            },
          },
        },
      };
    case "DELETE_MEAL": {
      const {[action.id]: _, ...mealsLeft} =
        state?.plans?.plans[state?.plans?.current ?? 1] || {};
      return {
        ...state,
        plans: {
          ...state?.plans,
          plans: {
            ...state?.plans?.plans,
            [state?.plans?.current ?? 1]: mealsLeft,
          },
        },
      };
    }
    case "EDIT_MEAL":
      return {
        ...state,
        plans: {
          ...state?.plans,
          plans: {
            ...state?.plans?.plans,
            [state?.plans?.current ?? 1]: {
              ...state?.plans?.plans[state?.plans?.current ?? 1],
              [action.id]: {
                ...state?.plans?.plans[state?.plans?.current ?? 1][action.id],
                ...action.meal,
              },
            },
          },
        },
      };
    case "SET_IDEAS":
      return {
        ...state,
        ideas: {
          ...state?.ideas,
          ideas: action.ideas,
        },
      };
    case "CLEAR_IDEAS":
      return {
        ...state,
        ideas: {
          ...state?.ideas,
          ideas: [],
        },
      };
    case "SET_INGREDIENTS":
      return {
        ...state,
        ingredients: {
          ...state?.ingredients,
          ingredients: action.ingredients,
        },
      };
    case "CLEAR_INGREDIENTS":
      return {
        ...state,
        ingredients: {
          ...state?.ingredients,
          ingredients: {},
        },
      };
    case "ADD_INGREDIENT":
      return {
        ...state,
        ingredients: {
          ...state?.ingredients,
          ingredients: {
            ...state?.ingredients?.ingredients,
            [action.id]: action.item,
          },
        },
      };
    case "DELETE_INGREDIENT": {
      const {[action.id]: _, ...ingredientsLeft} =
        state?.ingredients?.ingredients || {};
      return {
        ...state,
        ingredients: {
          ...state?.ingredients,
          ingredients: ingredientsLeft,
        },
      };
    }
    case "EDIT_INGREDIENT":
      return {
        ...state,
        ingredients: {
          ...state?.ingredients,
          ingredients: {
            ...state?.ingredients?.ingredients,
            [action.id]: {
              ...state?.ingredients?.ingredients[action.id],
              ...action.item,
            },
          },
        },
      };
  }
}

// ===== USER CONTEXT ===== //

interface UserContextType {
  user: User | null;
  dispatch: Dispatch<UserAction>;
}

export const UserContext = createContext<UserContextType | null>(null);

export const useUserDispatch = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be in UserProvider");

  const d = context.dispatch;
  if (!d) throw new Error("dispatch is not set");
  return d;
};

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

export default useUser;
