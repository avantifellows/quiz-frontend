import { PortalIdentifiers } from "@/types";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const portalBackendBaseUrl = (process.env.VUE_APP_PORTAL_BACKEND || "").replace(/\/$/, "");

let cachedIdentifiers: PortalIdentifiers | null | undefined;

const getCookieValue = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie?.split(";") || [];
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.trim().split("=");
    if (key === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
};

const getStoredToken = (key: string): string | null => {
  const cookieValue = getCookieValue(key);
  if (cookieValue) return cookieValue;

  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn("Unable to read token from localStorage", error);
    return null;
  }
};

const decodeToken = async (accessToken: string): Promise<PortalIdentifiers | null> => {
  if (!portalBackendBaseUrl) return null;

  const response = await fetch(`${portalBackendBaseUrl}/auth/verify`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  const tokenData = payload?.data ?? {};

  const canonicalUserId = tokenData.user_id ?? payload?.id ?? null;
  if (!canonicalUserId) {
    return null;
  }

  return {
    userId: String(canonicalUserId),
    studentId: tokenData.student_id ? String(tokenData.student_id) : null,
    apaarId: tokenData.apaar_id ? String(tokenData.apaar_id) : null,
    group: tokenData.group ? String(tokenData.group) : null,
    displayId: tokenData.display_id ? String(tokenData.display_id) : null,
    displayIdType: tokenData.display_id_type ?? null,
  };
};

const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
  if (!portalBackendBaseUrl) return null;

  const response = await fetch(`${portalBackendBaseUrl}/auth/refresh-token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${refreshToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const newAccessToken: string | undefined = data?.access_token;

  if (!newAccessToken) return null;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
    } catch (error) {
      console.warn("Unable to persist refreshed access token", error);
    }
  }

  if (typeof document !== "undefined") {
    const cookieParts = [
      `access_token=${encodeURIComponent(newAccessToken)}`,
      "Path=/",
      "SameSite=None",
      "Secure",
    ];

    if (window?.location?.hostname && !window.location.hostname.includes("localhost")) {
      cookieParts.push("Domain=.avantifellows.org");
    }

    document.cookie = cookieParts.join("; ");
  }

  return newAccessToken;
};

const verifyTokens = async (): Promise<PortalIdentifiers | null> => {
  const accessToken = getStoredToken(ACCESS_TOKEN_KEY);
  if (!accessToken) {
    return null;
  }

  const directDecode = await decodeToken(accessToken);

  if (directDecode) {
    return directDecode;
  }

  const refreshToken = getStoredToken(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    return null;
  }

  const refreshedAccessToken = await refreshAccessToken(refreshToken);
  if (!refreshedAccessToken) {
    return null;
  }

  return decodeToken(refreshedAccessToken);
};

export const getPortalIdentifiers = async (
  options: { force?: boolean } = {}
): Promise<PortalIdentifiers | null> => {
  const { force = false } = options;

  if (!force && cachedIdentifiers !== undefined) {
    return cachedIdentifiers;
  }

  try {
    const identifiers = await verifyTokens();
    cachedIdentifiers = identifiers ?? null;
    return cachedIdentifiers;
  } catch (error) {
    console.warn("Unable to resolve portal identifiers", error);
    cachedIdentifiers = null;
    return null;
  }
};

export const getCachedPortalIdentifiers = (): PortalIdentifiers | null => {
  if (cachedIdentifiers === undefined) {
    return null;
  }
  return cachedIdentifiers;
};

const clearCookie = (name: string) => {
  if (typeof document === "undefined") return;

  const attributes = [
    `${name}=`,
    "Path=/",
    "Expires=Thu, 01 Jan 1970 00:00:01 GMT",
    "SameSite=None",
    "Secure",
  ];

  if (window?.location?.hostname && !window.location.hostname.includes("localhost")) {
    attributes.push("Domain=.avantifellows.org");
  }

  document.cookie = attributes.join("; ");
};

export const clearPortalTokens = (): void => {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.warn("Unable to clear stored portal tokens", error);
    }
  }

  clearCookie(ACCESS_TOKEN_KEY);
  clearCookie(REFRESH_TOKEN_KEY);
  cachedIdentifiers = undefined;
};
