import { ensureAuth } from "./auth";

export const getAuthHeaders = () => {
  const auth = ensureAuth();
  return {
    "x-auth-id": auth.customerId,
    "x-customer-name": auth.customerName || "",
  };
};

export const authenticatedFetcher = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error);
  }

  return res.json();
};
