import prismaPkg from "../../../prisma/generated/prisma/index.js";

const { PrismaClient } = prismaPkg as any;

declare global {
  // eslint-disable-next-line no-var
  var __prisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma =
  globalThis.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
