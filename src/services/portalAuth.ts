import { PortalIdentifiers } from "@/types";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const QUIZ_PORTAL_SESSION_KEY = "quiz_portal_session";

const portalBackendBaseUrl = (process.env.VUE_APP_PORTAL_BACKEND || "").replace(/\/$/, "");
const IS_PROD = process.env.NODE_ENV === "production";

let cachedIdentifiers: PortalIdentifiers | null | undefined;
let cachedTokenKey: string | null | undefined;

interface QuizPortalSessionState {
  quizId: string;
  identifiers: PortalIdentifiers;
}

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

  if (IS_PROD) return null;
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn("Unable to read token from localStorage", error);
    return null;
  }
};

const getSessionStorage = (): Storage | null => {
  if (typeof window === "undefined") return null;

  try {
    return window.sessionStorage;
  } catch (error) {
    console.warn("Unable to access sessionStorage", error);
    return null;
  }
};

const readQuizPortalSession = (): QuizPortalSessionState | null => {
  const storage = getSessionStorage();
  if (!storage) return null;

  try {
    const rawValue = storage.getItem(QUIZ_PORTAL_SESSION_KEY);
    if (!rawValue) return null;
    const parsed = JSON.parse(rawValue);
    if (
      !parsed ||
      typeof parsed.quizId !== "string" ||
      !parsed.identifiers ||
      typeof parsed.identifiers.userId !== "string"
    ) {
      return null;
    }

    return parsed as QuizPortalSessionState;
  } catch (error) {
    console.warn("Unable to read quiz portal session", error);
    return null;
  }
};

const writeQuizPortalSession = (value: QuizPortalSessionState | null): void => {
  const storage = getSessionStorage();
  if (!storage) return;

  try {
    if (!value) {
      storage.removeItem(QUIZ_PORTAL_SESSION_KEY);
      return;
    }

    storage.setItem(QUIZ_PORTAL_SESSION_KEY, JSON.stringify(value));
  } catch (error) {
    console.warn("Unable to persist quiz portal session", error);
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

  if (!IS_PROD && typeof window !== "undefined") {
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
  options: { force?: boolean; launchToken?: string | null } = {}
): Promise<PortalIdentifiers | null> => {
  const { force = false, launchToken = null } = options;
  const cacheKey = launchToken || "persistent";

  if (!force && cachedIdentifiers !== undefined && cachedTokenKey === cacheKey) {
    return cachedIdentifiers;
  }

  try {
    const identifiers = launchToken
      ? await decodeToken(launchToken)
      : await verifyTokens();
    cachedIdentifiers = identifiers ?? null;
    cachedTokenKey = cacheKey;
    return cachedIdentifiers;
  } catch (error) {
    console.warn("Unable to resolve portal identifiers", error);
    cachedIdentifiers = null;
    cachedTokenKey = cacheKey;
    return null;
  }
};

export const getStoredQuizPortalSession = (): QuizPortalSessionState | null => {
  return readQuizPortalSession();
};

export const getStoredQuizPortalIdentifiers = (
  quizId: string | null
): PortalIdentifiers | null => {
  if (!quizId) return null;

  const storedSession = readQuizPortalSession();
  if (!storedSession || storedSession.quizId !== quizId) {
    return null;
  }

  return storedSession.identifiers;
};

export const persistQuizPortalSession = (
  quizId: string,
  identifiers: PortalIdentifiers
): void => {
  writeQuizPortalSession({
    quizId,
    identifiers,
  });
  cachedIdentifiers = identifiers;
  cachedTokenKey = `quiz:${quizId}`;
};

export const clearQuizPortalSession = (quizId?: string | null): void => {
  const storedSession = readQuizPortalSession();
  if (quizId && storedSession && storedSession.quizId !== quizId) {
    return;
  }

  writeQuizPortalSession(null);
  cachedIdentifiers = undefined;
  cachedTokenKey = undefined;
};
