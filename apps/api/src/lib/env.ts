import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(16),
  WEB_ORIGIN: z.string().url().default("http://localhost:3000"),

  KHIPU_API_KEY: z.string().min(1).optional(),
  KHIPU_RECEIVER_ID: z.string().min(1).optional(),
  KHIPU_BASE_URL: z.string().url().default("https://docs.khipu.com"),
  KHIPU_API_HOST: z.string().url().default("https://payment-api.khipu.com"),
  KHIPU_SUBSCRIPTION_NOTIFY_URL: z.string().url().optional(),
  KHIPU_CHARGE_NOTIFY_URL: z.string().url().optional(),
  KHIPU_RETURN_URL: z.string().url().optional(),
  KHIPU_CANCEL_URL: z.string().url().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // Membership
  SUBSCRIPTION_PRICE_CLP: z.coerce.number().int().positive().default(5000)
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse(process.env);
