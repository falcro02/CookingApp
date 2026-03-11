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
