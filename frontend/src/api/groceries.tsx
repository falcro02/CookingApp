import {API_URL, getHeaders} from "@hooks/apiHelper";
import {GroceriesState, GroceryItem} from "@shared/types/groceries";

export async function getGroceries(): Promise<GroceriesState> {
  console.log("fetching user groceries");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/groceries`, {
    method: "GET",
    headers,
  });
  if (!res.ok) throw new Error("error while calling the server");
  return await res.json();
}

export async function patchGroceryItem(id: string, item: Partial<GroceryItem>) {
  console.log("patching grocery item");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/groceries/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error("error while calling the server");
}

export async function deleteGroceryItem(id: string) {
  console.log("deleting grocery item");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/groceries/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("error while calling the server");
}
