import { OAUTH_STATE_COOKIE, encodeOAuthState } from "@shared/const";

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

function oauthConfiguration() {
  return {
    portalUrl: process.env.NEXT_PUBLIC_OAUTH_PORTAL_URL?.trim() ?? "",
    appId: process.env.NEXT_PUBLIC_APP_ID?.trim() ?? "",
  };
}

export function isOAuthLoginConfigured() {
  const { portalUrl, appId } = oauthConfiguration();
  if (!portalUrl || !appId) return false;

  try {
    const url = new URL(portalUrl);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

// Start the Manus OAuth login from an event handler. A one-time nonce binds
// the callback to this browser; never call this during render.
export function startLogin(): boolean {
  const { portalUrl, appId } = oauthConfiguration();
  if (!isOAuthLoginConfigured()) return false;

  const portal = new URL(portalUrl);
  portal.pathname = `${portal.pathname.replace(/\/+$/, "")}/app-auth`;
  portal.search = "";
  portal.hash = "";

  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const nonce = crypto.randomUUID();
  document.cookie = `${OAUTH_STATE_COOKIE}=${nonce}; Path=/; Max-Age=600; SameSite=None; Secure`;
  const state = encodeOAuthState({ redirectUri, nonce });

  portal.searchParams.set("appId", appId);
  portal.searchParams.set("redirectUri", redirectUri);
  portal.searchParams.set("state", state);
  portal.searchParams.set("type", "signIn");

  window.location.href = portal.toString();
  return true;
}
