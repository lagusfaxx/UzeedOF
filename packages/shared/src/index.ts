import { z } from "zod";

export const RoleSchema = z.enum(["USER", "ADMIN"]);
export type Role = z.infer<typeof RoleSchema>;

export const RegisterSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(72)
});

export const LoginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(72)
});

export const CreatePostSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(5000),
  mediaUrl: z.string().url().optional(),
  mediaType: z.enum(["IMAGE", "VIDEO"]).optional(),
  isPaid: z.boolean().default(true)
});

export const MeSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: RoleSchema,
  subscriptionActive: z.boolean(),
  subscriptionExpiresAt: z.string().datetime().nullable()
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type MeResponse = z.infer<typeof MeSchema>;
