import {API_URL, getHeaders} from "@hooks/apiHelper";
import {PlansState} from "@shared/types/plans";

export async function getPlans(): Promise<PlansState> {
  console.log("fetching user plans");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/plans`, {method: "GET", headers});
  if (!res.ok) throw new Error("error while calling the server");
  return await res.json();
}
