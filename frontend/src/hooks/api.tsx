import {fetchAuthSession} from "aws-amplify/auth";

export const API_URL = import.meta.env.VITE_API_URL!;

export const getHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {};
  headers["Content-Type"] = "application/json";
  if (import.meta.env.DEV) return headers;

  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    headers["Authorization"] = `Bearer ${idToken}`;
  } catch {
    console.warn("No user session found");
  }

  return headers;
};
