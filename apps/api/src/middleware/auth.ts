import type { Request, Response, NextFunction } from "express";

export type SessionUser = { userId: string };

declare module "express-session" {
  interface SessionData {
    user?: SessionUser;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user?.userId) {
    return res.status(401).json({ error: "UNAUTHENTICATED" });
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const role = (req as any).userRole as string | undefined;
  if (role !== "ADMIN") {
    return res.status(403).json({ error: "FORBIDDEN" });
  }
  next();
}
