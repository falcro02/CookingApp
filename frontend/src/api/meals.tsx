import {API_URL, getHeaders} from "@hooks/api";
import {PlanItem} from "@shared/types/plans";

export interface AddMealRequest {
  description: string;
  icon: string;
  weekDay: number;
  plan: number;
}

export async function addMeal(req: AddMealRequest): Promise<{itemId: string}> {
  console.log("adding plan item");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/meals`, {
    method: "POST",
    headers,
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error("error while calling the server");
  return await res.json();
}

export async function deleteMeal(id: string): Promise<void> {
  console.log("deleting plan item");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/meals/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("error while calling the server");
}

export async function patchMeal(
  id: string,
  req: Partial<PlanItem>,
): Promise<void> {
  console.log("editing plan item");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/meals/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error("error while calling the server");
}
