import {API_URL, getHeaders} from "@hooks/api";
import {
  PreferencesState,
  UpdatePreferencesInput,
} from "@shared/types/preferences";

export async function getPreferences(): Promise<PreferencesState> {
  console.log("fetching preferences");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/preferences`, {method: "GET", headers});
  if (!res.ok) throw new Error("error while calling the server");
  return await res.json();
}

export async function patchPreferences(item: {
  preferences: UpdatePreferencesInput;
}): Promise<void> {
  console.log("patching preferences");
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/preferences`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error("error while calling the server");
}
