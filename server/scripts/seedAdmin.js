import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'adarshkhare.codes@gmail.com';
    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      console.log('Admin user already exists. Updating role to admin...');
      admin.role = 'admin';
      await admin.save();
      console.log('Admin role updated.');
    } else {
      console.log('Creating admin user...');
      const hashedPassword = await bcrypt.hash('123456', 10);
      admin = await User.create({
        username: 'adarsh',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin user created.');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedAdmin();
