import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1).max(60),
  sortOrder: z.number().int().optional().default(0),
});

export const menuItemSchema = z.object({
  category: z.string().min(1),
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().default(''),
  price: z.number().min(0),
  imageUrl: z.string().url().or(z.literal('')).optional().default(''),
  isVeg: z.boolean().optional().default(true),
  dietaryLabels: z.array(z.string()).optional().default([]),
  modifiers: z
    .array(
      z.object({
        name: z.string().min(1),
        priceDelta: z.number().optional().default(0),
      })
    )
    .optional()
    .default([]),
  isAvailable: z.boolean().optional().default(true),
});

export const updateItemSchema = menuItemSchema.partial();

export const tableSchema = z.object({
  number: z.string().min(1).max(20),
});