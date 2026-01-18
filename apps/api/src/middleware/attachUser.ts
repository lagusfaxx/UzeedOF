import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export async function attachUser(req: Request, _res: Response, next: NextFunction) {
  const userId = req.session.user?.userId;
  if (!userId) return next();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true }
    });
    if (user) {
      (req as any).userId = user.id;
      (req as any).userRole = user.role;
      (req as any).userEmail = user.email;
    }
  } catch {
    // ignore; handled by routes as unauthenticated
  }
  next();
}
