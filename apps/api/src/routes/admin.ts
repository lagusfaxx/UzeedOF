import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { CreatePostSchema } from "@uzeed/shared";

export const adminRouter = Router();

adminRouter.post("/admin/posts", requireAuth, requireAdmin, async (req, res) => {
  const parsed = CreatePostSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "VALIDATION", details: parsed.error.flatten() });
  }

  const post = await prisma.post.create({
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
      mediaUrl: parsed.data.mediaUrl,
      mediaType: parsed.data.mediaType,
      isPaid: parsed.data.isPaid
    }
  });

  return res.json({ ok: true, post });
});

adminRouter.get("/admin/posts", requireAuth, requireAdmin, async (_req, res) => {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return res.json({ posts });
});
