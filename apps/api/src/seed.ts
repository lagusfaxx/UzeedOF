import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase() || "admin@uzeed.cl";
  const adminPass = process.env.ADMIN_PASSWORD || "Admin1234!";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPass, 12);
    await prisma.user.create({ data: { email: adminEmail, passwordHash, role: "ADMIN" } });
    console.log(`Created admin: ${adminEmail} / ${adminPass}`);
  }

  const count = await prisma.post.count();
  if (count === 0) {
    await prisma.post.create({
      data: {
        title: "Bienvenido a UZEED",
        body: "Este es el primer post del MVP. Suscríbete para ver contenido completo.",
        isPaid: true
      }
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
