import { z } from "zod";

export const orderStatusSchema = z.object({
  status: z.enum(["new", "confirmed", "processing", "shipped", "delivered", "cancelled"]),
});

export const reviewStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});

export const newsletterStatusSchema = z.object({
  isSubscribed: z.boolean(),
});
