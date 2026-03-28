export interface PlanItem {
  description: string;
  icon: string;
  weekDay: number;
}

export interface Plan {
  [planItemId: string]: PlanItem;
}

export interface Plans {
  [planNr: string]: Plan;
}

export interface PlansState {
  current: number;
  plans: Plans;
}

export interface CreateMealInput {
  description: string;
  icon: string;
  weekDay: number;
  plan: number;
}

export interface UpdateMealInput {
  description?: string;
  icon?: string;
}

export interface CurrentPlanRequest {
  current: number;
}
