import 'dotenv/config';
import { connectDB, disconnectDB } from './config/db.js';
import { Restaurant } from './models/Restaurant.js';
import { User } from './models/User.js';

async function run() {
  await connectDB();

  let restaurant = await Restaurant.findOne({ name: 'Demo Bistro' });
  if (!restaurant) {
    restaurant = await Restaurant.create({
      name: 'Demo Bistro',
      address: 'MG Road, Bengaluru',
      phone: '+91 90000 00000',
      taxPercent: 5,
      serviceChargePercent: 0,
      deliveryFee: 30,
    });
    console.log('Created restaurant', restaurant._id);
  }

  const accounts = [
    { email: 'admin@demo.local', name: 'Admin', role: 'admin' },
    { email: 'manager@demo.local', name: 'Manager', role: 'manager' },
    { email: 'waiter@demo.local', name: 'Waiter', role: 'waiter' },
    { email: 'cook@demo.local', name: 'Cook', role: 'cook' },
    { email: 'delivery@demo.local', name: 'Delivery', role: 'delivery' },
    { email: 'customer@demo.local', name: 'Customer', role: 'customer' },
  ];

  for (const acc of accounts) {
    const existing = await User.findOne({ email: acc.email });
    if (existing) continue;
    const user = new User({
      name: acc.name,
      email: acc.email,
      role: acc.role,
      restaurant: acc.role === 'admin' ? null : restaurant._id,
    });
    await user.setPassword('Password123!');
    await user.save();
    console.log('Created', acc.email, acc.role);
  }

  await disconnectDB();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});