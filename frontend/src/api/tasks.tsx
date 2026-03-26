import {API_URL, getHeaders} from "@hooks/api";

export async function getTaskStatus(id: string): Promise<{status: number}> {
  console.log("fetching task status");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/tasks/${id}`, {method: "GET", headers});
  if (!res.ok) throw new Error("error while calling the server");
  return await res.json();
}
