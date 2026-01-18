import cron from "node-cron";
import { prisma } from "./prisma";
import { sendEmail } from "./mailer";
import { env } from "./env";
import { createKhipuChargeIntent, fetchKhipuSubscriptionStatus } from "./khipu";

const MEMBERSHIP_DAYS = 30;

export function startCron() {
  // Runs daily at 09:00 server time
  cron.schedule("0 9 * * *", async () => {
    const now = new Date();
    const inThreeDays = new Date(now);
    inThreeDays.setDate(inThreeDays.getDate() + 3);

    // Email reminders
    const expiring = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        currentPeriodEnd: { lte: inThreeDays, gt: now }
      },
      include: { user: true }
    });

    for (const s of expiring) {
      await sendEmail(
        s.user.email,
        "Tu suscripción UZEED vence pronto",
        `Hola! Tu suscripción vence el ${s.currentPeriodEnd.toISOString().slice(0, 10)}.\n\nPuedes renovar desde tu panel.`
      );
    }

    // Attempt to create charge intents for expired subscriptions (MVP). In production you should track payment reconciliation.
    const expired = await prisma.subscription.findMany({
      where: { status: "ACTIVE", currentPeriodEnd: { lte: now }, khipuSubscriptionId: { not: null } },
      include: { user: true }
    });

    if (!env.KHIPU_CHARGE_NOTIFY_URL || !env.KHIPU_API_KEY) return;

    for (const s of expired) {
      const subId = s.khipuSubscriptionId!;
      try {
        const remote = await fetchKhipuSubscriptionStatus(subId);
        if (remote.status !== "ENABLED") continue;

        const txId = `UZEED-AUTO-${s.userId}-${Date.now()}`;
        await createKhipuChargeIntent({
          subscription_id: subId,
          amount: env.SUBSCRIPTION_PRICE_CLP,
          subject: "UZEED - Suscripción mensual",
          body: `Renovación automática. Transaction: ${txId}`,
          error_response_url: `${env.WEB_ORIGIN}/billing/error`,
          custom: "UZEED",
          transaction_id: txId,
          notify_url: env.KHIPU_CHARGE_NOTIFY_URL
        });

        // Optimistic extension for MVP
        const next = new Date(now);
        next.setDate(next.getDate() + MEMBERSHIP_DAYS);
        await prisma.subscription.update({ where: { id: s.id }, data: { currentPeriodEnd: next } });
      } catch (e) {
        console.error("[cron] charge intent failed", e);
      }
    }
  });
}
