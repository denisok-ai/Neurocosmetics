/**
 * @file schemas.ts
 * @description Zod-схемы валидации для заказов, оформления, профиля
 * @dependencies zod
 * @created 2025-03-05
 */

import { z } from "zod";

export const checkoutSchema = z.object({
  fullName: z.string().min(2, "Укажите имя"),
  email: z.string().email("Некорректный email"),
  phone: z.string().min(10, "Укажите телефон"),
  address: z.string().min(5, "Укажите адрес доставки"),
  comment: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const profileSchema = z.object({
  full_name: z.string().min(2, "Укажите имя"),
  phone: z.string().min(10, "Укажите телефон").optional().or(z.literal("")),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
