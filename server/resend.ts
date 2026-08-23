import { ENV } from "./_core/env";

const RESEND_API_URL = "https://api.resend.com";
const RESEND_USER_AGENT = "akbarnawasunda-fan-signal/1.0";

export class ResendApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ResendApiError";
  }
}

type ResendResult = {
  response: Response;
  data: Record<string, unknown> | null;
};

async function requestResend(
  path: string,
  init: RequestInit = {},
): Promise<ResendResult> {
  if (!ENV.resendApiKey) {
    throw new ResendApiError(503, "Resend is not configured");
  }

  const response = await fetch(`${RESEND_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${ENV.resendApiKey}`,
      "Content-Type": "application/json",
      "User-Agent": RESEND_USER_AGENT,
      ...init.headers,
    },
    signal: init.signal ?? AbortSignal.timeout(10_000),
  });

  const raw = await response.text();
  let data: Record<string, unknown> | null = null;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      data = parsed as Record<string, unknown>;
    }
  } catch {
    data = null;
  }

  return { response, data };
}

function throwResendError(result: ResendResult, fallback: string): never {
  const providerMessage = typeof result.data?.message === "string"
    ? result.data.message
    : fallback;
  throw new ResendApiError(result.response.status, providerMessage);
}

function contactPayload(email: string, source: "home" | "footer") {
  const payload: Record<string, unknown> = {
    email,
    unsubscribed: false,
    properties: {
      source,
      channel: "fan-signal",
    },
  };

  if (ENV.resendSegmentId) {
    payload.segments = [{ id: ENV.resendSegmentId }];
  }

  return payload;
}

export async function syncFanSignalContact(
  email: string,
  source: "home" | "footer",
) {
  if (!ENV.resendApiKey) {
    console.warn("[Resend] API key is not configured; keeping Fan Signal in the local database only");
    return { configured: false as const, synced: false as const };
  }

  const payload = contactPayload(email, source);
  const created = await requestResend("/contacts", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (created.response.ok) {
    return {
      configured: true as const,
      synced: true as const,
      contactId: typeof created.data?.id === "string" ? created.data.id : undefined,
    };
  }

  // Resend may reject a duplicate contact. Updating by email makes repeated
  // signups idempotent and also re-subscribes a contact who returns later.
  if ([400, 409, 422].includes(created.response.status)) {
    const updated = await requestResend(`/contacts/${encodeURIComponent(email)}`, {
      method: "PATCH",
      body: JSON.stringify({
        unsubscribed: false,
        properties: {
          source,
          channel: "fan-signal",
        },
      }),
    });

    if (updated.response.ok) {
      return {
        configured: true as const,
        synced: true as const,
        contactId: typeof updated.data?.id === "string" ? updated.data.id : undefined,
      };
    }
  }

  throwResendError(created, "Fan Signal contact sync failed");
}

export function getResendReadiness() {
  return {
    configured: Boolean(ENV.resendApiKey),
    fromEmail: ENV.resendFromEmail,
    segmentConfigured: Boolean(ENV.resendSegmentId),
  };
}

export async function createResendBroadcast(input: {
  name: string;
  subject: string;
  html: string;
  text?: string;
}) {
  if (!ENV.resendSegmentId) {
    throw new ResendApiError(503, "Resend segment is not configured");
  }

  const result = await requestResend("/broadcasts", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      segment_id: ENV.resendSegmentId,
      from: ENV.resendFromEmail,
      subject: input.subject,
      html: input.html,
      text: input.text,
      send: false,
    }),
  });

  if (!result.response.ok) {
    throwResendError(result, "Broadcast draft creation failed");
  }

  return {
    id: typeof result.data?.id === "string" ? result.data.id : undefined,
  };
}

export async function sendResendBroadcast(broadcastId: string) {
  const result = await requestResend(`/broadcasts/${encodeURIComponent(broadcastId)}/send`, {
    method: "POST",
    body: JSON.stringify({}),
  });

  if (!result.response.ok) {
    throwResendError(result, "Broadcast send failed");
  }

  return {
    id: typeof result.data?.id === "string" ? result.data.id : broadcastId,
  };
}
