import { Router } from "express";
import { prisma } from "../lib/prisma";

export const postsRouter = Router();

postsRouter.get("/posts", async (req, res) => {
  const userId = req.session.user?.userId;

  let hasActiveSub = false;
  if (userId) {
    const sub = await prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE", currentPeriodEnd: { gt: new Date() } },
      orderBy: { currentPeriodEnd: "desc" }
    });
    hasActiveSub = !!sub;
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      body: true,
      mediaUrl: true,
      mediaType: true,
      isPaid: true,
      createdAt: true
    }
  });

  const safe = posts.map((p) => {
    const locked = p.isPaid && !hasActiveSub;
    return {
      id: p.id,
      title: p.title,
      body: locked ? p.body.slice(0, 140) + "…" : p.body,
      mediaUrl: locked ? null : p.mediaUrl,
      mediaType: locked ? null : p.mediaType,
      locked,
      createdAt: p.createdAt
    };
  });

  return res.json({ posts: safe, subscriptionActive: hasActiveSub });
});
