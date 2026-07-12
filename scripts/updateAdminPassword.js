const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const updatePassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB Atlas...');

    let user = await User.findOne({ role: 'admin' });
    if (!user) {
      user = await User.findOne({ email: 'admin@mytravelbandhu.com' });
    }
    
    if (!user) {
      console.log('No admin user found. Creating a new one...');
      user = new User({
        name: 'System Administrator',
        role: 'admin'
      });
    }

    user.email = 'ankitrathor0661@gmail.com';
    user.password = 'Ankit@123'; // Will be hashed automatically by pre-save hook
    await user.save();
    console.log('Admin credentials updated successfully:');
    console.log('Email: ankitrathor0661@gmail.com');
    console.log('Password: Ankit@123');
    process.exit(0);
  } catch (err) {
    console.error('Error updating password:', err);
    process.exit(1);
  }
};

updatePassword();
