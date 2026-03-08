import {PlansState} from "@shared/types/plans";

export async function getPlans(): Promise<PlansState> {
  console.log("fetching user plans");
  const res = await fetch("/api/plans");
  if (!res.ok) throw new Error("error while calling the server");
  return await res.json();
}
