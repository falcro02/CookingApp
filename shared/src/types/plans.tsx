export interface PlanItem {
    description: string;
    icon: string;
    weekDay: number;
}

export interface Plans {
    [planNr: string]: {
        [planItemId: string]: PlanItem;
    };
}

export interface PlansState {
    current: number;
    plans: Plans;
}

