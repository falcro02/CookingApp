export interface GroceryItem {
  description: string;
  weekDay: number;
  checked: boolean;
}

export interface Groceries {
  [planItemId: string]: GroceryItem;
}

export interface GroceriesState {
  groceries: Groceries;
}
