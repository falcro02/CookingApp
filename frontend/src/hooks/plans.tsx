export interface MealsByDay {
  [weekDay: number]: DayMeals;
}

export interface DayMeals {
  [id: string]: Meal;
}

export interface Meal {
  description: string;
  icon: string;
}

export default MealsByDay;
