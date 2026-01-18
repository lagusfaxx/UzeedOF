import { env } from "./env";

export type KhipuCreateSubscriptionResponse = {
  subscription_id: string;
  redirect_url: string;
};

export type KhipuSubscriptionStatusResponse = {
  subscription_id: string;
  status: "DISABLED" | "SIGNED" | "ENABLED";
  developer: boolean;
  customer_bank_code: string;
  service_reference: string;
};

export type KhipuCreateChargeIntentResponse = {
  payment_id: string;
};

function apiBase() {
  // According to Khipu docs, Automatic Payments API server is https://payment-api.khipu.com
  return env.KHIPU_API_HOST || "https://payment-api.khipu.com";
}

async function khipuFetch(path: string, init: RequestInit) {
  if (!env.KHIPU_API_KEY) {
    throw new Error("Missing KHIPU_API_KEY");
  }

  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.KHIPU_API_KEY,
      ...(init.headers || {})
    }
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // ignore
  }

  if (!res.ok) {
    const err = new Error(`Khipu error ${res.status}: ${text}`);
    (err as any).status = res.status;
    (err as any).payload = json ?? text;
    throw err;
  }

  return json;
}

export async function createKhipuSubscription(input: {
  name: string;
  email: string;
  max_amount: number;
  currency: "CLP";
  notify_url: string;
  return_url: string;
  cancel_url: string;
  service_reference?: string;
  image_url?: string;
  description?: string;
}): Promise<KhipuCreateSubscriptionResponse> {
  return await khipuFetch("/v1/automatic-payment/subscription", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function fetchKhipuSubscriptionStatus(id: string): Promise<KhipuSubscriptionStatusResponse> {
  return await khipuFetch(`/v1/automatic-payment/subscription/${encodeURIComponent(id)}`, {
    method: "GET"
  });
}

export async function createKhipuChargeIntent(input: {
  subscription_id: string;
  amount: number;
  subject: string;
  body: string;
  error_response_url: string;
  custom: string;
  transaction_id: string;
  notify_url: string;
  notify_api_version?: string;
}): Promise<KhipuCreateChargeIntentResponse> {
  return await khipuFetch("/v1/automatic-payment/charge-intent", {
    method: "POST",
    body: JSON.stringify(input)
  });
}
