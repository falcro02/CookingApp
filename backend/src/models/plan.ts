export interface CurrentPlan {
    PK: string; // USER#<id>
    SK: string; // CURRENT_PLAN
    current: number; // 1-4
}

export interface PlanItem {
    description: string;
    icon: string;
    weekDay: number;
}

export interface PlansResponse {
    current: number;
    plans: Record<string, Record<string, PlanItem>>;
}
