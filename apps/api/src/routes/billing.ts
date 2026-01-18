import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { env } from "../lib/env";
import {
  createKhipuSubscription,
  fetchKhipuSubscriptionStatus,
  createKhipuChargeIntent
} from "../lib/khipu";

export const billingRouter = Router();

const MEMBERSHIP_DAYS = 30;

function priceClp() {
  return env.SUBSCRIPTION_PRICE_CLP;
}

billingRouter.post("/billing/subscribe", requireAuth, async (req, res) => {
  if (!env.KHIPU_API_KEY) {
    return res.status(500).json({ error: "KHIPU_NOT_CONFIGURED" });
  }
  if (!env.KHIPU_SUBSCRIPTION_NOTIFY_URL || !env.KHIPU_RETURN_URL || !env.KHIPU_CANCEL_URL) {
    return res.status(500).json({ error: "MISSING_KHIPU_URLS" });
  }

  const userId = req.session.user!.userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ error: "UNAUTHENTICATED" });

  const existing = await prisma.subscription.findFirst({
    where: { userId, status: { in: ["PENDING", "ACTIVE"] } },
    orderBy: { createdAt: "desc" }
  });

  if (existing?.khipuSubscriptionId) {
    // If already created, reuse redirect.
    const status = await fetchKhipuSubscriptionStatus(existing.khipuSubscriptionId).catch(() => null);
    return res.json({
      ok: true,
      already: true,
      status: status?.status ?? null,
      subscription_id: existing.khipuSubscriptionId
    });
  }

  const name = `UZEED Membership - ${user.email}`;

  const created = await createKhipuSubscription({
    name,
    email: user.email,
    max_amount: priceClp(),
    currency: "CLP",
    notify_url: env.KHIPU_SUBSCRIPTION_NOTIFY_URL,
    return_url: env.KHIPU_RETURN_URL,
    cancel_url: env.KHIPU_CANCEL_URL,
    service_reference: user.email,
    image_url: `${env.WEB_ORIGIN}/brand/isotipo.png`,
    description: "UZEED - suscripción mensual"
  });

  await prisma.subscription.create({
    data: {
      userId,
      status: "PENDING",
      khipuSubscriptionId: created.subscription_id,
      currentPeriodEnd: new Date(0)
    }
  });

  return res.json({ ok: true, redirect_url: created.redirect_url, subscription_id: created.subscription_id });
});

// This endpoint is called by Khipu after signing the PAC mandate.
billingRouter.post("/webhooks/khipu/subscription", async (req, res) => {
  const subscription_id = (req.body?.subscription_id as string | undefined) ?? "";
  const status = (req.body?.status as string | undefined) ?? "";

  if (!subscription_id) return res.status(400).json({ error: "MISSING_SUBSCRIPTION_ID" });

  // Server-to-server verification (required).
  const remote = await fetchKhipuSubscriptionStatus(subscription_id);

  const enabled = remote.status === "ENABLED";
  const disabled = remote.status === "DISABLED";

  const sub = await prisma.subscription.findFirst({ where: { khipuSubscriptionId: subscription_id } });
  if (!sub) return res.status(404).json({ error: "SUB_NOT_FOUND" });

  if (enabled) {
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + MEMBERSHIP_DAYS);

    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "ACTIVE", currentPeriodEnd: end }
    });
  } else if (disabled || status.toLowerCase() === "disabled") {
    await prisma.subscription.update({ where: { id: sub.id }, data: { status: "DISABLED" } });
  }

  return res.json({ ok: true });
});

// Manual renewal button (creates a charge intent). In production you'd schedule this.
billingRouter.post("/billing/renew", requireAuth, async (req, res) => {
  const userId = req.session.user!.userId;
  const sub = await prisma.subscription.findFirst({ where: { userId, status: "ACTIVE" }, orderBy: { createdAt: "desc" } });
  if (!sub?.khipuSubscriptionId) return res.status(400).json({ error: "NO_ACTIVE_SUBSCRIPTION" });

  if (!env.KHIPU_CHARGE_NOTIFY_URL) return res.status(500).json({ error: "MISSING_KHIPU_URLS" });

  const txId = `UZEED-${userId}-${Date.now()}`;

  const charge = await createKhipuChargeIntent({
    subscription_id: sub.khipuSubscriptionId,
    amount: priceClp(),
    subject: "UZEED - Suscripción mensual",
    body: `Cargo mensual UZEED. Transaction: ${txId}`,
    error_response_url: `${env.WEB_ORIGIN}/billing/error`,
    custom: "UZEED",
    transaction_id: txId,
    notify_url: `${env.KHIPU_CHARGE_NOTIFY_URL}` // We'll accept /webhooks/khipu/charge behind reverse proxy
  });

  return res.json({ ok: true, payment_id: charge.payment_id });
});

// Charge notify: for MVP we extend membership when notified.
billingRouter.post("/webhooks/khipu/charge", async (req, res) => {
  // Khipu says it POSTs parameters to fetch payment details; we accept both styles.
  const subscription_id = (req.body?.subscription_id as string | undefined) ?? (req.body?.subscriptionId as string | undefined);

  if (!subscription_id) {
    // Some implementations only send payment_id & token; we still ACK and log.
    console.log("[khipu-charge-notify] body:", req.body);
    return res.json({ ok: true });
  }

  const sub = await prisma.subscription.findFirst({ where: { khipuSubscriptionId: subscription_id } });
  if (!sub) return res.status(404).json({ error: "SUB_NOT_FOUND" });

  const now = new Date();
  const base = sub.currentPeriodEnd > now ? sub.currentPeriodEnd : now;
  const next = new Date(base);
  next.setDate(next.getDate() + MEMBERSHIP_DAYS);

  await prisma.subscription.update({ where: { id: sub.id }, data: { status: "ACTIVE", currentPeriodEnd: next } });

  return res.json({ ok: true });
});
