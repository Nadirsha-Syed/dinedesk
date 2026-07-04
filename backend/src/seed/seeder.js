import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Table } from '../models/Table.js';

console.log('--- STARTING DATABASE SEEDER ---');

const seedData = async () => {
  try {
    // Establish connection
    await mongoose.connect(env.MONGODB_URI);
    console.log('[Seeder] Connected to MongoDB database.');

    // 1. Purge old records
    console.log('[Seeder] Wiping old user and table records...');
    await User.deleteMany({});
    await Table.deleteMany({});

    // Wipe reservations collection dynamically to prevent dependency errors
    const dbCollections = await mongoose.connection.db.listCollections({ name: 'reservations' }).toArray();
    if (dbCollections.length > 0) {
      await mongoose.connection.db.collection('reservations').deleteMany({});
      console.log('[Seeder] Purged reservations collection.');
    }
    console.log('[Seeder] Database records wiped.');

    // 2. Seed Users
    console.log('[Seeder] Creating user credentials...');
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@dinedesk.com',
      password: 'adminPassword123',
      role: 'admin',
    });

    const customerUsers = await User.create([
      { name: 'John Doe', email: 'john@dinedesk.com', password: 'customerPassword123', role: 'customer' },
      { name: 'Jane Smith', email: 'jane@dinedesk.com', password: 'customerPassword123', role: 'customer' },
      { name: 'Robert Johnson', email: 'robert@dinedesk.com', password: 'customerPassword123', role: 'customer' },
      { name: 'Emily Davis', email: 'emily@dinedesk.com', password: 'customerPassword123', role: 'customer' },
      { name: 'Michael Wilson', email: 'michael@dinedesk.com', password: 'customerPassword123', role: 'customer' },
    ]);
    console.log(`[Seeder] Seeded 1 Admin (${adminUser.email}) and ${customerUsers.length} Customers.`);

    // 3. Seed Tables
    console.log('[Seeder] Creating table configurations...');
    const tablesList = [];

    // 5 Tables with 2-person capacity
    for (let i = 1; i <= 5; i++) {
      tablesList.push({ tableNumber: i, capacity: 2, isActive: true });
    }
    // 5 Tables with 4-person capacity
    for (let i = 6; i <= 10; i++) {
      tablesList.push({ tableNumber: i, capacity: 4, isActive: true });
    }
    // 3 Tables with 6-person capacity
    for (let i = 11; i <= 13; i++) {
      tablesList.push({ tableNumber: i, capacity: 6, isActive: true });
    }
    // 2 Tables with 8-person capacity
    for (let i = 14; i <= 15; i++) {
      tablesList.push({ tableNumber: i, capacity: 8, isActive: true });
    }

    const seededTables = await Table.create(tablesList);
    console.log(`[Seeder] Seeded ${seededTables.length} Tables successfully.`);

    console.log('--- DATABASE SEEDING COMPLETED SUCCESSFULLY ---');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder ERROR] Seeding failed:', error.message);
    process.exit(1);
  }
};

seedData();
