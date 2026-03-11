import {API_URL, getHeaders} from "@hooks/apiHelper";
import {GroceriesState} from "@shared/types/groceries";

export async function getGroceries(): Promise<GroceriesState> {
  console.log("fetching user groceries");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/groceries`, {method: "GET", headers});
  if (!res.ok) throw new Error("error while calling the server");
  return await res.json();
}
