
import { z } from 'zod';
export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email().max(200),
  password: z.string().min(8).max(100),
  role: z.enum(['customer','manager']).optional(),
  restaurantName: z.string().trim().min(2).max(100).optional()
});
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export const menuSchema = z.object({
  restaurantId: z.string().min(1), name: z.string().trim().min(1).max(120),
  description: z.string().max(1000).optional(), price: z.coerce.number().min(0),
  category: z.string().optional(), imageUrl: z.string().url().optional().or(z.literal('')),
  isVeg: z.boolean().optional(), available: z.boolean().optional()
});
export const orderSchema = z.object({
  restaurantId: z.string().min(1), orderType: z.enum(['DINE_IN','DELIVERY']),
  tableToken: z.string().optional(), customerName: z.string().trim().min(1).max(80),
  deliveryAddress: z.string().max(500).optional(),
  items: z.array(z.object({ menuItemId: z.string().min(1), quantity: z.coerce.number().int().min(1).max(50), notes: z.string().max(500).optional() })).min(1).max(40)
});
