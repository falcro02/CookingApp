import { mealRepository } from '../repositories/mealRepository';
import { planRepository } from '../repositories/planRepository';
import { PlansResponse, PlanItem } from '../models/plan';
import { Meal } from '../models/meal';

export const planService = {
    async getPlans(userId: string): Promise<PlansResponse> {
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

        // 3. If all plans are empty, return current as 1 with empty plans
        return { current, plans };
    },

    async setCurrentPlan(userId: string, plan: number): Promise<void> {
        // Validate plan number
        if (!Number.isInteger(plan) || plan < 1 || plan > 4) {
            const error = new Error('invalid field');
            (error as any).statusCode = 400;
            throw error;
        }

        // Check plan is not empty
        const meals = await mealRepository.findByPlan(userId, plan);
        if (meals.length === 0) {
            const error = new Error('plan not found (empty)');
            (error as any).statusCode = 404;
            throw error;
        }

        await planRepository.setCurrentPlan(userId, plan);
    },

    async deletePlan(userId: string, planNR: number): Promise<void> {
        // Validate plan number
        if (!Number.isInteger(planNR) || planNR < 1 || planNR > 4) {
            const error = new Error('invalid field');
            (error as any).statusCode = 400;
            throw error;
        }

        // Delete all meals in this plan
        await mealRepository.deleteByPlan(userId, planNR);

        // Auto-select the new current plan:
        // Find the first non-empty plan before the deleted one, or first non-empty overall
        const current = await planRepository.getCurrentPlan(userId);

        if (current === planNR) {
            // Need to find a new current plan
            let newCurrent = 1; // default fallback

            // Check plans before the deleted one first (descending), then after
            const searchOrder: number[] = [];
            for (let i = planNR - 1; i >= 1; i--) searchOrder.push(i);
            for (let i = planNR + 1; i <= 4; i++) searchOrder.push(i);

            for (const p of searchOrder) {
                const meals = await mealRepository.findByPlan(userId, p);
                if (meals.length > 0) {
                    newCurrent = p;
                    break;
                }
            }

            await planRepository.setCurrentPlan(userId, newCurrent);
        }
    },
};
