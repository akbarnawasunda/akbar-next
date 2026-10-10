import type { AppRequest, SessionCookieOptions } from "./httpTypes";

function isSecureRequest(req: AppRequest) {
  if (req.protocol?.toLowerCase() === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: AppRequest,
): Pick<SessionCookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const secure = isSecureRequest(req);
  return {
    httpOnly: true,
    path: "/",
    // SameSite=None is rejected by browsers unless Secure is also present.
    // Lax remains sufficient for the first-party session on plain HTTP dev.
    sameSite: secure ? "none" : "lax",
    secure,
  };
}
