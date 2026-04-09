import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
});

export type SignInInput = z.infer<typeof signInSchema>;
