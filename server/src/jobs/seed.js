
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import MenuCategory from '../models/MenuCategory.js';
import MenuItem from '../models/MenuItem.js';
import Table from '../models/Table.js';
import { randomBytes } from 'node:crypto';

await mongoose.connect(process.env.MONGODB_URI);
const email = 'manager@example.com';
let user = await User.findOne({ email });
if (!user) user = await User.create({ name: 'Demo Manager', email, passwordHash: await bcrypt.hash('ChangeMe123!', 12), role: 'manager' });
let restaurant = await Restaurant.findOne({ owner: user._id });
if (!restaurant) restaurant = await Restaurant.create({ name: 'Demo Restaurant', slug: 'demo-restaurant', owner: user._id });
user.restaurantId = restaurant._id; await user.save();
let category = await MenuCategory.findOne({ restaurantId: restaurant._id, name: 'Popular' });
if (!category) category = await MenuCategory.create({ restaurantId: restaurant._id, name: 'Popular' });
if (!await MenuItem.exists({ restaurantId: restaurant._id })) {
  await MenuItem.insertMany([
    { restaurantId: restaurant._id, category: category._id, name: 'Paneer Tikka Wrap', description: 'Spiced paneer with fresh vegetables', price: 180, isVeg: true },
    { restaurantId: restaurant._id, category: category._id, name: 'Masala Fries', description: 'Crispy fries with house seasoning', price: 99, isVeg: true },
    { restaurantId: restaurant._id, category: category._id, name: 'Chicken Burger', description: 'Grilled chicken burger', price: 220, isVeg: false }
  ]);
}
if (!await Table.exists({ restaurantId: restaurant._id })) await Table.create({ restaurantId: restaurant._id, tableNumber: '1', seats: 2, qrToken: randomBytes(24).toString('hex') });
console.log('Seed complete. Manager: manager@example.com / ChangeMe123! — change this password immediately.');
await mongoose.disconnect();
