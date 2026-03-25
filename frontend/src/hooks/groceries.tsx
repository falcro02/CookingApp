export interface GroceriesByDay {
  [weekDay: number]: DayItems;
}

export interface DayItems {
  [id: string]: Item;
}

export interface Item {
  description: string;
  checked: boolean;
}

export default GroceriesByDay;
