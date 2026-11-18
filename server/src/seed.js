
import 'dotenv/config';
import mongoose from 'mongoose';

import { AuditLog } from './models/AuditLog.js';
import { DeliveryAssignment } from './models/DeliveryAssignment.js';
import { LocationConsent } from './models/LocationConsent.js';
import { LocationUpdate } from './models/LocationUpdate.js';
import { MenuCategory } from './models/MenuCategory.js';
import { MenuItem } from './models/MenuItem.js';
import { Notification } from './models/Notification.js';
import { Order } from './models/Order.js';
import { Payment } from './models/Payment.js';
import { Restaurant } from './models/Restaurant.js';
import { ServiceRequest } from './models/ServiceRequest.js';
import { Table } from './models/Table.js';
import { User } from './models/User.js';

// WARNING: Deletes existing documents from these 13 collections.
const MODELS = [
  AuditLog,
  DeliveryAssignment,
  LocationConsent,
  LocationUpdate,
  MenuCategory,
  MenuItem,
  Notification,
  Order,
  Payment,
  Restaurant,
  ServiceRequest,
  Table,
  User,
];

const passwordByRole = {
  admin: 'Admin@123',
  manager: 'Manager@123',
  waiter: 'Waiter@123',
  cook: 'Cook@123',
  delivery: 'Delivery@123',
  customer: 'Customer@123',
};

const restaurantSeeds = [
  {
    slug: 'sunrise',
    name: 'Sunrise Family Restaurant',
    address: 'Baner Road, Pune, Maharashtra, India',
    phone: '+91-9000001001',
    lat: 18.5590,
    lng: 73.7868,
  },
  {
    slug: 'urban-spice',
    name: 'Urban Spice Kitchen',
    address: 'Wakad, Pune, Maharashtra, India',
    phone: '+91-9000001002',
    lat: 18.5975,
    lng: 73.7630,
  },
  {
    slug: 'royal-taste',
    name: 'Royal Taste Bistro',
    address: 'Hinjawadi, Pune, Maharashtra, India',
    phone: '+91-9000001003',
    lat: 18.5913,
    lng: 73.7389,
  },
];

const menuSeed = [
  {
    category: 'Starters',
    items: [
      ['Paneer Tikka', 'Chargrilled paneer with spices', 240, true],
      ['Veg Crispy', 'Crispy seasonal vegetables', 190, true],
      ['Chicken Tikka', 'Tandoori chicken pieces', 290, false],
      ['Hara Bhara Kebab', 'Spinach and green pea patties', 180, true],
      ['Chicken 65', 'Spicy South Indian chicken starter', 260, false],
    ],
  },
  {
    category: 'Main Course',
    items: [
      ['Paneer Butter Masala', 'Paneer in a rich tomato gravy', 280, true],
      ['Dal Tadka', 'Yellow lentils tempered with spices', 190, true],
      ['Butter Chicken', 'Chicken in creamy tomato gravy', 330, false],
      ['Kadai Paneer', 'Paneer with peppers and kadai masala', 270, true],
      ['Chicken Curry', 'Traditional homestyle chicken curry', 300, false],
    ],
  },
  {
    category: 'Rice & Biryani',
    items: [
      ['Veg Biryani', 'Fragrant basmati rice with vegetables', 220, true],
      ['Chicken Biryani', 'Dum-cooked chicken basmati biryani', 290, false],
      ['Jeera Rice', 'Basmati rice with cumin', 150, true],
      ['Steamed Rice', 'Plain steamed basmati rice', 120, true],
      ['Egg Biryani', 'Basmati rice with boiled eggs', 240, false],
    ],
  },
  {
    category: 'Breads',
    items: [
      ['Butter Naan', 'Soft tandoor naan with butter', 55, true],
      ['Garlic Naan', 'Naan topped with garlic', 70, true],
      ['Tandoori Roti', 'Whole wheat tandoor bread', 35, true],
      ['Laccha Paratha', 'Layered flaky Indian bread', 65, true],
      ['Kulcha', 'Soft leavened bread', 60, true],
    ],
  },
  {
    category: 'Beverages',
    items: [
      ['Masala Chaas', 'Chilled spiced buttermilk', 50, true],
      ['Fresh Lime Soda', 'Fresh lime with soda', 80, true],
      ['Mango Lassi', 'Sweet mango yogurt drink', 110, true],
      ['Cold Coffee', 'Chilled coffee with milk', 130, true],
      ['Mineral Water', 'Packaged drinking water', 30, true],
    ],
  },
  {
    category: 'Desserts',
    items: [
      ['Gulab Jamun', 'Warm milk dumplings in sugar syrup', 90, true],
      ['Brownie with Ice Cream', 'Chocolate brownie with vanilla ice cream', 160, true],
      ['Rasmalai', 'Soft cheese patties in saffron milk', 120, true],
      ['Vanilla Ice Cream', 'Two scoops of vanilla ice cream', 100, true],
      ['Chocolate Mousse', 'Light chocolate dessert', 140, true],
    ],
  },
];

const round2 = (value) => Math.round(value * 100) / 100;
const pick = (array, index) => array[index % array.length];


async function createUsers(restaurants) {
  const result = [];

  for (let i = 0; i < restaurants.length; i++) {
    const restaurant = restaurants[i];

    // Get slug from restaurantSeeds instead of MongoDB Restaurant document
    const slug = restaurantSeeds[i].slug;

    const roles = [
      'admin',
      'manager',
      'waiter',
      'cook',
      'delivery',
      'customer',
    ];

    for (const role of roles) {
      const user = new User({
        name: `${role[0].toUpperCase()}${role.slice(1)} ${slug}`,
        email: `${role}@${slug}.demo.com`,
        phone: `90000${String(10000 + result.length).slice(-5)}`,
        role,
        restaurant: restaurant._id,
        isActive: true,
      });

      await user.setPassword(passwordByRole[role]);
      await user.save();

      result.push(user);
    }
  }

  return result;
}


async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is missing. Add it to your server/.env file.'
    );
  }

  await mongoose.connect(process.env.MONGODB_URI);

  console.log(
    `Connected to MongoDB database: ${mongoose.connection.name}`
  );

  // Clear all 13 collections.
  console.log('Clearing existing collections...');

  for (const Model of MODELS) {
    await Model.deleteMany({});
  }

  console.log('Existing data cleared.');

  // 1. Restaurants
  const restaurants = await Restaurant.insertMany(
    restaurantSeeds.map((r) => ({
      name: r.name,
      address: r.address,
      phone: r.phone,
      location: {
        lat: r.lat,
        lng: r.lng,
      },
      taxPercent: 5,
      serviceChargePercent: 2,
      deliveryFee: 40,
      currency: 'INR',
      isActive: true,
    }))
  );

  // 2. Users
  const users = await createUsers(restaurants);

  const usersFor = (restaurantId) =>
    users.filter(
      (u) => String(u.restaurant) === String(restaurantId)
    );

  const userFor = (restaurantId, role) =>
    usersFor(restaurantId).find((u) => u.role === role);

  const tablesByRestaurant = new Map();
  const categoriesByRestaurant = new Map();
  const menuByRestaurant = new Map();

  // 3. Tables
  // 4. Categories
  // 5. Menu Items
  for (const restaurant of restaurants) {
    const tableDocs = await Table.insertMany(
      Array.from({ length: 15 }, (_, i) => ({
        restaurant: restaurant._id,
        number: `T${String(i + 1).padStart(2, '0')}`,
        isActive: true,
      }))
    );

    tablesByRestaurant.set(
      String(restaurant._id),
      tableDocs
    );

    const categoryDocs = await MenuCategory.insertMany(
      menuSeed.map((category, index) => ({
        restaurant: restaurant._id,
        name: category.category,
        sortOrder: index + 1,
        isActive: true,
      }))
    );

    categoriesByRestaurant.set(
      String(restaurant._id),
      categoryDocs
    );

    const menuDocs = [];

    for (
      let categoryIndex = 0;
      categoryIndex < menuSeed.length;
      categoryIndex++
    ) {
      const category = menuSeed[categoryIndex];
      const categoryDoc = categoryDocs[categoryIndex];

      for (const [name, description, price, isVeg] of category.items) {
        menuDocs.push({
          restaurant: restaurant._id,
          category: categoryDoc._id,
          name: name.trim(),
          description,
          price,
          imageUrl: '',
          isVeg,
          dietaryLabels: isVeg ? ['vegetarian'] : [],
          modifiers: [
            { name: 'Extra portion', priceDelta: 40 },
            { name: 'Less spicy', priceDelta: 0 },
          ],
          isAvailable: true,
        });
      }
    }

    const insertedMenu = await MenuItem.insertMany(menuDocs);

    menuByRestaurant.set(
      String(restaurant._id),
      insertedMenu
    );
  }

  // Arrays for remaining collections.
  const orderDocs = [];
  const paymentDocs = [];
  const assignmentDocs = [];
  const consentDocs = [];
  const locationDocs = [];
  const notificationDocs = [];
  const serviceRequestDocs = [];
  const auditDocs = [];

  const orderScenarios = [
    ['PENDING_PAYMENT', 'PENDING'],
    ['PAYMENT_FAILED', 'FAILED'],
    ['PAID', 'SUCCESS'],
    ['CONFIRMED', 'SUCCESS'],
    ['PREPARING', 'SUCCESS'],
    ['READY', 'SUCCESS'],
    ['OUT_FOR_DELIVERY', 'SUCCESS'],
    ['DELIVERED', 'SUCCESS'],
    ['COMPLETED', 'SUCCESS'],
    ['CANCELLED', 'FAILED'],
    ['SERVED', 'SUCCESS'],
    ['COMPLETED', 'SUCCESS'],
    ['PREPARING', 'SUCCESS'],
    ['READY', 'SUCCESS'],
    ['DELIVERED', 'SUCCESS'],
    ['COMPLETED', 'SUCCESS'],
    ['CONFIRMED', 'SUCCESS'],
    ['CANCELLED', 'SUCCESS'],
    ['OUT_FOR_DELIVERY', 'SUCCESS'],
    ['SERVED', 'SUCCESS'],
  ];

  // 6. Orders
  for (
    let restaurantIndex = 0;
    restaurantIndex < restaurants.length;
    restaurantIndex++
  ) {
    const restaurant = restaurants[restaurantIndex];
    const restaurantKey = String(restaurant._id);

    const customer = userFor(restaurant._id, 'customer');
    const waiter = userFor(restaurant._id, 'waiter');
    const manager = userFor(restaurant._id, 'manager');
    const deliveryPartner = userFor(restaurant._id, 'delivery');

    const tables = tablesByRestaurant.get(restaurantKey);
    const menu = menuByRestaurant.get(restaurantKey);

    for (let i = 0; i < 20; i++) {
      const isDelivery = i % 5 < 3;

      const [status, paymentStatus] = orderScenarios[i];

      const orderItems = [
        pick(menu, i),
        pick(menu, i + 7),
      ].map((item, itemIndex) => {
        const quantity = itemIndex + 1;
        const lineTotal = round2(item.price * quantity);

        return {
          menuItemId: item._id,
          name: item.name,
          unitPrice: item.price,
          quantity,
          modifiers: [],
          lineTotal,
          notes: itemIndex === 0 ? 'Demo order item' : '',
        };
      });

      const subtotal = round2(
        orderItems.reduce(
          (sum, item) => sum + item.lineTotal,
          0
        )
      );

      const taxPercent = restaurant.taxPercent;
      const taxAmount = round2(
        (subtotal * taxPercent) / 100
      );

      const serviceChargePercent = isDelivery
        ? 0
        : restaurant.serviceChargePercent;

      const serviceCharge = round2(
        (subtotal * serviceChargePercent) / 100
      );

      const deliveryFee = isDelivery
        ? restaurant.deliveryFee
        : 0;

      const total = round2(
        subtotal +
        taxAmount +
        serviceCharge +
        deliveryFee
      );

      const table = isDelivery ? null : pick(tables, i);

      const order = await Order.create({
        orderNumber: `DEMO-${restaurantIndex + 1}-${String(i + 1).padStart(4, '0')}`,

        restaurant: restaurant._id,
        orderType: isDelivery ? 'DELIVERY' : 'DINE_IN',

        table: table?._id ?? null,

        customer: customer._id,
        customerName: customer.name,
        customerPhone: customer.phone,

        deliveryAddress: isDelivery
          ? `${100 + i}, Demo Residency, Wakad, Pune, Maharashtra, India`
          : '',

        deliveryLocation: isDelivery
          ? {
              lat: 18.59 + i * 0.0005,
              lng: 73.76 + i * 0.0005,
            }
          : {
              lat: null,
              lng: null,
            },

        items: orderItems,

        subtotal,
        taxPercent,
        taxAmount,
        serviceChargePercent,
        serviceCharge,
        deliveryFee,
        discount: 0,
        total,

        status,
        paymentStatus,

        statusHistory: [
          {
            status,
            by: manager._id,
            note: 'Created by demo seeder',
          },
        ],

        deliveryPartner: isDelivery
          ? deliveryPartner._id
          : null,

        specialInstructions:
          i % 4 === 0 ? 'Demo: no extra spicy' : '',

        completedAt: ['COMPLETED', 'DELIVERED'].includes(status)
          ? new Date()
          : null,

        cancelledAt: status === 'CANCELLED'
          ? new Date()
          : null,
      });

      orderDocs.push(order);

      // 7. Payments
      const paymentRecordStatus =
        paymentStatus === 'PENDING'
          ? 'PENDING'
          : paymentStatus === 'FAILED'
            ? 'FAILED'
            : 'SUCCESS';

      paymentDocs.push({
        order: order._id,
        restaurant: restaurant._id,
        user: customer._id,
        provider: 'demo',
        razorpayOrderId: `demo_order_${restaurantIndex + 1}_${i + 1}`,
        amount: total,
        currency: 'INR',
        status: paymentRecordStatus,
        method: pick(
          ['UPI', 'CARD', 'CASH', 'NETBANKING'],
          i
        ),
        failureReason:
          paymentRecordStatus === 'FAILED'
            ? 'Demo payment failure'
            : '',
      });

      // 8. Delivery Assignments
      // 9. Location Consents
      // 10. Location Updates
      if (isDelivery) {
        const assignmentStatus =
          status === 'CANCELLED'
            ? 'CANCELLED'
            : ['DELIVERED', 'COMPLETED'].includes(status)
              ? 'DELIVERED'
              : status === 'OUT_FOR_DELIVERY'
                ? 'OUT_FOR_DELIVERY'
                : 'ASSIGNED';

        assignmentDocs.push({
          restaurant: restaurant._id,
          order: order._id,
          partner: deliveryPartner._id,
          assignedBy: manager._id,
          status: assignmentStatus,

          pickedUpAt: [
            'OUT_FOR_DELIVERY',
            'DELIVERED',
            'COMPLETED',
          ].includes(status)
            ? new Date()
            : null,

          deliveredAt: ['DELIVERED', 'COMPLETED'].includes(status)
            ? new Date()
            : null,
        });

        consentDocs.push(
          {
            order: order._id,
            user: customer._id,
            role: 'customer',
            granted: true,
            grantedAt: new Date(),
          },
          {
            order: order._id,
            user: deliveryPartner._id,
            role: 'delivery',
            granted: true,
            grantedAt: new Date(),
          }
        );

        locationDocs.push(
          {
            order: order._id,
            user: customer._id,
            role: 'customer',
            lat: 18.59 + i * 0.0005,
            lng: 73.76 + i * 0.0005,
            accuracy: 15,
            recordedAt: new Date(),
          },
          {
            order: order._id,
            user: deliveryPartner._id,
            role: 'delivery',
            lat: 18.591 + i * 0.0005,
            lng: 73.761 + i * 0.0005,
            accuracy: 10,
            recordedAt: new Date(),
          }
        );
      }

      // 11. Notifications
      notificationDocs.push({
        restaurant: restaurant._id,
        order: order._id,
        type: 'ORDER_UPDATE',
        eventId: `demo-order-${restaurantIndex + 1}-${i + 1}`,
        title: `Order ${order.orderNumber}`,
        message: `Demo order status: ${status}`,
        payload: {
          orderNumber: order.orderNumber,
          status,
        },
        targetRoles: [
          'admin',
          'manager',
          'waiter',
          'cook',
        ],
      });

      // 12. Service Requests
      if (i % 2 === 0 && !isDelivery) {
        serviceRequestDocs.push({
          restaurant: restaurant._id,
          table: pick(tables, i)._id,
          order: order._id,
          type: i % 4 === 0
            ? 'WAITER_CALL'
            : 'BILL_REQUEST',
          note: i % 4 === 0
            ? 'Customer requested assistance'
            : 'Customer requested the bill',
          status: i % 4 === 0
            ? 'OPEN'
            : 'ACKNOWLEDGED',
          acknowledgedBy: i % 4 === 0
            ? null
            : waiter._id,
        });
      }
    }

    // 13. Audit Logs
    auditDocs.push(
      {
        restaurant: restaurant._id,
        user: userFor(restaurant._id, 'admin')._id,
        action: 'DEMO_SEED',
        targetType: 'Restaurant',
        targetId: String(restaurant._id),
        details: {
          message: 'Restaurant demo data seeded',
        },
        ip: '127.0.0.1',
      },
      {
        restaurant: restaurant._id,
        user: manager._id,
        action: 'MENU_CREATED',
        targetType: 'MenuItem',
        details: {
          count: menu.length,
        },
        ip: '127.0.0.1',
      },
      {
        restaurant: restaurant._id,
        user: waiter._id,
        action: 'TABLES_CREATED',
        targetType: 'Table',
        details: {
          count: tables.length,
        },
        ip: '127.0.0.1',
      }
    );
  }

  // Insert remaining collections.
  await Payment.insertMany(paymentDocs);
  await DeliveryAssignment.insertMany(assignmentDocs);
  await LocationConsent.insertMany(consentDocs);
  await LocationUpdate.insertMany(locationDocs);
  await Notification.insertMany(notificationDocs);
  await ServiceRequest.insertMany(serviceRequestDocs);
  await AuditLog.insertMany(auditDocs);

  console.log('\n========== SEED COMPLETED ==========');

  console.table([
    { collection: 'restaurants', inserted: restaurants.length },
    { collection: 'users', inserted: users.length },
    { collection: 'tables', inserted: tablesByRestaurant.size * 15 },
    {
      collection: 'menuCategories',
      inserted: categoriesByRestaurant.size * menuSeed.length,
    },
    {
      collection: 'menuItems',
      inserted: [...menuByRestaurant.values()].reduce(
        (n, a) => n + a.length,
        0
      ),
    },
    { collection: 'orders', inserted: orderDocs.length },
    { collection: 'payments', inserted: paymentDocs.length },
    { collection: 'deliveryAssignments', inserted: assignmentDocs.length },
    { collection: 'locationConsents', inserted: consentDocs.length },
    { collection: 'locationUpdates', inserted: locationDocs.length },
    { collection: 'notifications', inserted: notificationDocs.length },
    { collection: 'serviceRequests', inserted: serviceRequestDocs.length },
    { collection: 'auditLogs', inserted: auditDocs.length },
  ]);

  console.log('\nDEMO LOGIN PATTERN');
  console.log('Email: <role>@<restaurant-slug>.demo.com');

  console.table(
    Object.entries(passwordByRole).map(([role, password]) => ({
      role,
      password,
    }))
  );

  console.log(
    'Restaurant slugs: sunrise, urban-spice, royal-taste'
  );
}

seed()
  .catch((error) => {
    console.error('SEED FAILED:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
