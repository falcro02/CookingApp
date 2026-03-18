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

export interface CreateGroceryRequest {
  description: string;
  weekDay: number;
}

export interface UpdateGroceryRequest {
  description?: string;
  checked?: boolean;
}

export interface GenerateGroceriesRequest {
  days: number[];
  plan: number;
  unplanned: string[];
  extra: string;
  replace: boolean;
}

export interface CheckAllRequest {
  check: boolean;
}
