import mongoose from 'mongoose';
import { User } from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({ email: { $in: ['officer@police.gov.in', 'inspector@police.gov.in', 'admin@police.gov.in'] } }).select('email role password');
    console.log('Police users:');
    users.forEach(user => {
      console.log(`- ${user.email}: ${user.role}, password hash: ${user.password ? 'exists' : 'missing'}`);
    });

    // Test password for officer
    const officer = users.find(u => u.email === 'officer@police.gov.in');
    if (officer) {
      const isValid = await officer.comparePassword('demo123');
      console.log('Officer password test:', isValid);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUsers();