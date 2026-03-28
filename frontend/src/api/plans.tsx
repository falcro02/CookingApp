import {API_URL, getHeaders} from "@hooks/api";
import {CurrentPlanRequest, PlansState} from "@shared/types/plans";

export async function getPlans(): Promise<PlansState> {
  console.log("fetching plans");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/plans`, {method: "GET", headers});
  if (!res.ok) throw new Error("error while calling the server");
  return await res.json();
}

export async function setCurrentPlan(req: CurrentPlanRequest): Promise<void> {
  console.log("setting current plan");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/plans/current`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error("error while calling the server");
}

export async function deletePlan(planNr: number): Promise<void> {
  console.log("deleting plan");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/plans/${planNr}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("error while calling the server");
}
