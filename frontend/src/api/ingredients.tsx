import {API_URL, getHeaders} from "@hooks/api";
import {IngredientItem, IngredientsState} from "@shared/types/ingredients";

export async function getIngredients(): Promise<IngredientsState> {
  console.log("getting ingredients");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/ingredients`, {
    method: "GET",
    headers,
  });
  if (!res.ok) throw new Error("error while calling the server");
  return await res.json();
}

export async function clearIngredients(): Promise<void> {
  console.log("clearing ingredients");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/ingredients`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("error while calling the server");
}

export async function addIngredient(
  req: IngredientItem,
): Promise<{itemId: string}> {
  console.log("adding ingredient");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/ingredients`, {
    method: "POST",
    headers,
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error("error while calling the server");
  return await res.json();
}

export async function deleteIngredient(id: string): Promise<void> {
  console.log("deleting ingredient");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/ingredients/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("error while calling the server");
}

export async function patchIngredient(
  id: string,
  req: Partial<IngredientItem>,
): Promise<void> {
  console.log("patching ingredient");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/ingredients/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error("error while calling the server");
}

export async function importIngredients(): Promise<void> {
  console.log("importing ingredients");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/ingredients/import`, {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error("error while calling the server");
}
