import bcrypt from 'bcryptjs';
import User from './models/User.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables

const registerAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ email: 'ilsmannn@gmail.com' });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('ilsman54321', 10);

    const newUser = new User({
      name: 'admin',
      email: 'ilsmannn@gmail.com',
      password: hashedPassword,
      role: 'admin',
    });

    await newUser.save();
    console.log('✅ Admin user created successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

registerAdmin();