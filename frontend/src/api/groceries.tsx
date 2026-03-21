import {API_URL, getHeaders} from "@hooks/apiHelper";
import {GroceriesState, GroceryItem} from "@shared/types/groceries";

export interface CheckAllRequest {
  check: boolean;
}

export async function getGroceries(): Promise<GroceriesState> {
  console.log("fetching groceries");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/groceries`, {
    method: "GET",
    headers,
  });
  if (!res.ok) throw new Error("error while calling the server");
  return await res.json();
}

export async function clearGroceries(): Promise<void> {
  console.log("clearing groceries");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/groceries`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("error while calling the server");
}

export async function checkGroceries(req: CheckAllRequest): Promise<void> {
  console.log((req.check ? "un" : "") + "checking groceries");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/groceries/check`, {
    method: "POST",
    headers,
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error("error while calling the server");
}

export async function patchGroceryItem(
  id: string,
  item: Partial<GroceryItem>,
): Promise<void> {
  console.log("patching grocery item");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/groceries/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error("error while calling the server");
}

export async function addGroceryItem(
  item: Partial<GroceryItem>,
): Promise<{itemId: string}> {
  console.log("adding grocery item");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/groceries`, {
    method: "POST",
    headers,
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error("error while calling the server");
  return await res.json();
}

export async function deleteGroceryItem(id: string): Promise<void> {
  console.log("deleting grocery item");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/groceries/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("error while calling the server");
}
