import {API_URL, getHeaders} from "@hooks/api";
import {GenerateIdeasRequest, IdeasState} from "@shared/types/ideas";

export async function getIdeas(): Promise<IdeasState> {
  console.log("fetching ideas");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/ideas`, {
    method: "GET",
    headers,
  });
  if (!res.ok) throw new Error("error while calling the server");
  return await res.json();
}

export async function clearIdeas(): Promise<void> {
  console.log("clearing ideas");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/ideas`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("error while calling the server");
}

export async function generateIdeas(
  req: GenerateIdeasRequest,
): Promise<{taskId: string}> {
  console.log("clearing ideas");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/ideas/generate`, {
    method: "POST",
    headers,
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error("error while calling the server");
  return await res.json();
}
