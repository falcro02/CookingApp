import {API_URL, getHeaders} from "@hooks/api";
import {CreateMealInput, UpdateMealInput} from "@shared/types/plans";

export async function addMeal(req: CreateMealInput): Promise<{itemId: string}> {
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
  req: UpdateMealInput,
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
