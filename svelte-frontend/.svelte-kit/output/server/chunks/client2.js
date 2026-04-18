import { p as public_env } from "./shared-server.js";
import { w as writable } from "./index2.js";
const AUTH_USER_KEY = "venera_auth_user";
function loadUserFromStorage() {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function saveUserToStorage(user) {
  if (typeof window === "undefined") return;
  try {
    if (user) ;
    else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch {
  }
}
const initialUser = loadUserFromStorage();
const authStore = writable({
  user: initialUser,
  initialized: !!initialUser
});
function clearAuth() {
  authStore.set({ user: null, initialized: true });
  saveUserToStorage(null);
}
const SCOPE_COOKIE_NAME = "venera_task_scope";
const SCOPE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;
function readCookie$1(name) {
  if (typeof document === "undefined") return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
function parseScopeFromCookie() {
  const raw = readCookie$1(SCOPE_COOKIE_NAME);
  if (!raw) {
    return { type: "personal" };
  }
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.type === "team" && parsed.teamId && parsed.teamName) {
      return parsed;
    }
    return { type: "personal" };
  } catch {
    return { type: "personal" };
  }
}
function persistScopeToCookie(scope) {
  if (typeof document === "undefined") return;
  document.cookie = `${SCOPE_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(scope))}; Max-Age=${SCOPE_COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
}
const initialScope = parseScopeFromCookie();
let currentScope = initialScope;
const teamScopeStore = writable(initialScope);
teamScopeStore.subscribe((scope) => {
  currentScope = scope;
  persistScopeToCookie(scope);
});
function switchToPersonalScope() {
  if (currentScope.type === "personal") return;
  teamScopeStore.set({ type: "personal" });
}
function switchToTeamScope(teamId, teamName) {
  if (!teamId || !teamName.trim()) return;
  if (currentScope.type === "team" && currentScope.teamId === teamId && currentScope.teamName === teamName) {
    return;
  }
  teamScopeStore.set({ type: "team", teamId, teamName: teamName.trim() });
}
function getActiveTeamId() {
  return currentScope.type === "team" ? currentScope.teamId : null;
}
function getActiveScopeKey() {
  return currentScope.type === "team" ? `team:${currentScope.teamId}` : "personal";
}
const API_BASE = public_env.PUBLIC_API_BASE_URL ?? "http://localhost:8080";
function getApiBase() {
  return API_BASE;
}
async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const method = (options.method ?? "GET").toUpperCase();
  const headers = {
    ...options.headers
  };
  if (!headers["Content-Type"] && options.body && !isFormDataBody(options.body)) {
    headers["Content-Type"] = "application/json";
  }
  const teamId = getActiveTeamId();
  if (teamId && !headers["X-Team-Id"]) {
    headers["X-Team-Id"] = teamId;
  }
  if (isStateChangingMethod(method)) {
    await ensureCsrfCookie();
    const csrfToken = readCookie("XSRF-TOKEN");
    if (csrfToken) {
      headers["X-XSRF-TOKEN"] = csrfToken;
    }
  }
  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include"
  });
  if (res.status === 401 && typeof window !== "undefined") {
    clearAuth();
  }
  return res;
}
function isStateChangingMethod(method) {
  return method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";
}
function isFormDataBody(body) {
  return typeof FormData !== "undefined" && body instanceof FormData;
}
function readCookie(name) {
  if (typeof document === "undefined") {
    return null;
  }
  const entry = document.cookie.split("; ").find((value) => value.startsWith(`${name}=`));
  if (!entry) return null;
  return decodeURIComponent(entry.split("=").slice(1).join("="));
}
let csrfInFlight = null;
async function ensureCsrfCookie() {
  if (typeof window === "undefined") return;
  if (readCookie("XSRF-TOKEN")) return;
  if (!csrfInFlight) {
    csrfInFlight = fetch(`${API_BASE}/auth/csrf`, { credentials: "include" }).then(() => void 0).finally(() => {
      csrfInFlight = null;
    });
  }
  await csrfInFlight;
}
export {
  apiFetch as a,
  switchToTeamScope as b,
  clearAuth as c,
  authStore as d,
  getApiBase as e,
  getActiveScopeKey as g,
  switchToPersonalScope as s,
  teamScopeStore as t
};
