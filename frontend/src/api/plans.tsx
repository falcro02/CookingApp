import {PlansState} from "@shared/types/plans";
import {SERVER_URL} from "@hooks/config";

export async function getPlans(): Promise<PlansState> {
  const res = await fetch(`${SERVER_URL}/plans`, {
    method: "GET",
  });
  return null;
}
