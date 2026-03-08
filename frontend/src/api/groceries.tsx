import {GroceriesState} from "@shared/types/groceries";

export async function getGroceries(): Promise<GroceriesState> {
  console.log("fetching user groceries");
  const res = await fetch("/api/groceries");
  if (!res.ok) throw new Error("error while calling the server");
  return await res.json();
}
