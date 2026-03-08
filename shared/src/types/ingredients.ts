export interface IngredientItem {
  description: string;
}

export interface Ingredients {
  [ingredientItemId: string]: IngredientItem;
}

export interface IngredientsState {
  ingredients: Ingredients;
}
