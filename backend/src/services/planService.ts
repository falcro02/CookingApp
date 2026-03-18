import { mealRepository } from '../repositories/mealRepository';
import { planRepository } from '../repositories/planRepository';
import { PlansState, PlanItem } from '@shared/types/plans';

export const planService = {
    async getPlans(userId: string): Promise<PlansState> {
        // 1. Fetch all meals and current plan in parallel
        const [allMeals, current] = await Promise.all([
            mealRepository.findAllByUser(userId),
            planRepository.getCurrentPlan(userId),
        ]);

        // 2. Group meals by plan number
        const plans: Record<string, Record<string, PlanItem>> = {};

        for (const meal of allMeals) {
            const planKey = String(meal.plan);
            if (!plans[planKey]) {
                plans[planKey] = {};
            }
            plans[planKey][meal.itemID] = {
                description: meal.description,
                icon: meal.icon,
                weekDay: meal.weekDay,
            };
        }
        // 3. Ensure the current plan is always represented, even if empty
        if (!plans[current]) {
            plans[current] = {};
        }

        return {
            current,
            plans,
        };
    },

    async setCurrentPlan(userId: string, plan: number): Promise<void> {
        await planRepository.setCurrentPlan(userId, plan);
    },

    async deletePlan(userId: string, plan: number): Promise<void> {
        // 1. Delete all meals associated with this plan
        await mealRepository.deleteByPlan(userId, plan);

        // 2. Check if the plan being deleted is the current plan
        const currentPlan = await planRepository.getCurrentPlan(userId);
        if (currentPlan === plan) {
            // Reset to plan 1 if we deleted the current plan
            await planRepository.setCurrentPlan(userId, 1);
        }
    },
};
