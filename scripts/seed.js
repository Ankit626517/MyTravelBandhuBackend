const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('../config/db');
const User = require('../models/User');
const Package = require('../models/Package');
const FixedDeparture = require('../models/FixedDeparture');
const Blog = require('../models/Blog');
const Testimonial = require('../models/Testimonial');
const VisaTrack = require('../models/VisaTrack');
const Inquiry = require('../models/Inquiry');
const Subscriber = require('../models/Subscriber');

// Paths for reading frontend mockData
const mockDataPath = path.join(__dirname, '../../MyTravelBandhu/src/data/mockData.js');
const tempMockDataPath = path.join(__dirname, './temp_mockData.js');

const seedData = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    console.log('Clearing existing database collections...');
    await User.deleteMany();
    await Package.deleteMany();
    await FixedDeparture.deleteMany();
    await Blog.deleteMany();
    await Testimonial.deleteMany();
    await VisaTrack.deleteMany();
    await Inquiry.deleteMany();
    await Subscriber.deleteMany();
    console.log('Database cleared.');

    // 2. Read and convert frontend mockData.js (ES Modules to CommonJS)
    if (!fs.existsSync(mockDataPath)) {
      throw new Error(`Frontend mockData.js not found at ${mockDataPath}`);
    }

    console.log('Reading and converting mockData.js...');
    let rawContent = fs.readFileSync(mockDataPath, 'utf8');
    // Replace export const with const
    rawContent = rawContent.replace(/export const /g, 'const ');
    // Append CommonJS exports at the bottom
    rawContent += '\nmodule.exports = { domesticPackages, internationalPackages, fixedDepartures, mockBlogs, mockTestimonials };\n';
    
    // Write temporary module file
    fs.writeFileSync(tempMockDataPath, rawContent, 'utf8');

    // Load converted module
    const { 
      domesticPackages, 
      internationalPackages, 
      fixedDepartures, 
      mockBlogs, 
      mockTestimonials 
    } = require('./temp_mockData.js');

    // Remove temporary file immediately
    fs.unlinkSync(tempMockDataPath);
    console.log('Temporary conversion file cleaned up.');

    // 3. Create Admin User
    console.log('Seeding default administrator account...');
    await User.create({
      name: 'System Administrator',
      email: 'ankitrathor0661@gmail.com',
      password: 'Ankit@123', // Will be hashed by pre-save hook in User model
      role: 'admin'
    });
    console.log('Admin account created (User: ankitrathor0661@gmail.com, Password: Ankit@123).');

    // 4. Seed Packages (Domestic + International)
    console.log('Seeding packages...');
    const packageMap = {}; // Maps frontend string 'id' to new MongoDB ObjectId
    const allPkgs = [...domesticPackages, ...internationalPackages];

    for (const pkg of allPkgs) {
      const originalId = pkg.id;
      // Remove original custom string ID to let MongoDB assign ObjectId
      const pkgCopy = { ...pkg };
      delete pkgCopy.id;

      // Mark some popular packages manually for home screen
      if (originalId === 'dom-1' || originalId === 'dom-2' || originalId === 'int-1' || originalId === 'int-2') {
        pkgCopy.isPopular = true;
      }

      const createdPkg = await Package.create(pkgCopy);
      packageMap[originalId] = createdPkg._id;
    }
    console.log(`Successfully seeded ${allPkgs.length} packages.`);

    // 5. Seed Fixed Departures
    console.log('Seeding fixed departures...');
    let departureCount = 0;
    for (const fd of fixedDepartures) {
      const fdCopy = { ...fd };
      delete fdCopy.id;

      // Map packageId string to actual Mongoose ObjectId
      const targetObjectId = packageMap[fd.packageId];
      if (targetObjectId) {
        fdCopy.packageId = targetObjectId;
        await FixedDeparture.create(fdCopy);
        departureCount++;
      }
    }
    console.log(`Successfully seeded ${departureCount} fixed departures.`);

    // 6. Seed Blogs
    console.log('Seeding blogs...');
    for (const blog of mockBlogs) {
      const blogCopy = { ...blog };
      delete blogCopy.id;
      // Convert date string (e.g. "June 25, 2026") to Date object
      blogCopy.date = new Date(blog.date);
      await Blog.create(blogCopy);
    }
    console.log(`Successfully seeded ${mockBlogs.length} blog articles.`);

    // 7. Seed Testimonials
    console.log('Seeding testimonials...');
    for (const test of mockTestimonials) {
      const testCopy = { ...test };
      delete testCopy.id;
      await Testimonial.create(testCopy);
    }
    console.log(`Successfully seeded ${mockTestimonials.length} testimonials.`);

    // 8. Seed Default Visa Tracking numbers
    console.log('Seeding default visa tracking profiles...');
    await VisaTrack.create({
      receiptNumber: 'MTB-100204',
      name: 'Rohan Gupta',
      email: 'rohan@example.com',
      phone: '9876543210',
      country: 'Dubai',
      stage: 4,
      statusText: 'Visa Approved & Dispatched',
      detail: 'Congratulations! Your visa has been successfully stamped by the Embassy. Your passport is dispatched via DTDC (Tracking ID: DX-122449).'
    });
    await VisaTrack.create({
      receiptNumber: 'MTB-125',
      name: 'Preeti Sharma',
      email: 'preeti@example.com',
      phone: '9988776655',
      country: 'Schengen',
      stage: 2,
      statusText: 'Under Review by Expert',
      detail: 'Our senior visa specialist is verifying your ITR copies and sponsorship letters. VFS slots will be booked soon.'
    });
    console.log('Default visa tracking profiles seeded.');

    console.log('Database Seeding Completed Successfully! 🎉');
    process.exit(0);
  } catch (error) {
    console.error(`Database Seeding Failed: ${error.message}`);
    // Clean up temp file in case of error
    if (fs.existsSync(tempMockDataPath)) {
      fs.unlinkSync(tempMockDataPath);
    }
    process.exit(1);
  }
};

seedData();
