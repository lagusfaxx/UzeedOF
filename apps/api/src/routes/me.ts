import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const meRouter = Router();

meRouter.get("/me", requireAuth, async (req, res) => {
  const userId = req.session.user!.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true }
  });

  if (!user) return res.status(401).json({ error: "UNAUTHENTICATED" });

  const sub = await prisma.subscription.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { currentPeriodEnd: "desc" }
  });

  const now = new Date();
  const active = !!sub && sub.currentPeriodEnd > now;

  return res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    subscriptionActive: active,
    subscriptionExpiresAt: sub ? sub.currentPeriodEnd.toISOString() : null
  });
});
