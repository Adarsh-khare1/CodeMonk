import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import User from '../models/User.model.js';
import Problem from '../models/Problem.model.js';
import { reviewCodeWithGemini } from '../services/gemini.service.js';

import dotenv from 'dotenv';

dotenv.config();

async function runSanityTest() {
  console.log('🤖 Starting CodeMonk Integration & Sanity Test Suite...');
  
  const testId = crypto.randomBytes(4).toString('hex');
  const username = `testuser_${testId}`;
  const email = `testuser_${testId}@codemonk.test`;
  const password = 'TestSecurePassword123!';
  
  let createdUser = null;
  let createdProblem = null;

  try {
    // 1. Verify Database Connection
    console.log('🔌 Step 1: Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env');
    }
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB successfully.');

    // 2. Test User Model & Password Hashing
    console.log('👤 Step 2: Testing User registration and password hashing...');
    const user = new User({
      username,
      email,
      password,
      role: 'user'
    });
    
    createdUser = await user.save();
    console.log(`✅ User registered successfully. ID: ${createdUser._id}`);

    // Verify Password Match via comparePassword method
    console.log('🔑 Step 3: Verifying password matching algorithm...');
    const dbUser = await User.findById(createdUser._id).select('+password');
    const isMatch = await dbUser.comparePassword(password);
    if (!isMatch) {
      throw new Error('Verification failed: Passwords do not match!');
    }
    console.log('✅ Password match verified successfully.');

    // Test token generation
    console.log('🎫 Step 4: Testing JWT signing...');
    const secret = process.env.JWT_SECRET || 'secret';
    const token = jwt.sign(
      { id: dbUser._id, role: dbUser.role },
      secret,
      { expiresIn: '1h' }
    );
    const decoded = jwt.verify(token, secret);
    if (decoded.id !== String(dbUser._id)) {
      throw new Error('JWT payload verification failed!');
    }
    console.log('✅ JWT signature verified.');

    // 3. Test Problem Creation & Slug Generation
    console.log('📝 Step 5: Testing Problem creation and slug auto-generation...');
    const problem = new Problem({
      title: `Sanity Check Problem ${testId}`,
      description: 'Write a program to add two numbers.',
      difficulty: 'Easy',
      topics: ['Math', 'Basic'],
      starterCode: 'function add(a, b) {\n  return a + b;\n}',
      sampleTestCases: [
        { input: '2 3', output: '5' }
      ],
      testCases: [
        { input: '2 3', expectedOutput: '5', isPublic: true },
        { input: '10 -2', expectedOutput: '8', isPublic: false }
      ],
      constraints: ['-1000 <= a, b <= 1000']
    });

    createdProblem = await problem.save();
    console.log(`✅ Problem created. Slug: "${createdProblem.slug}"`);
    if (createdProblem.slug !== `sanity-check-problem-${testId}`) {
      throw new Error('Slug auto-generation mismatch!');
    }

    // 4. Test Gemini AI Coach Integration (if key present)
    if (process.env.GEMINI_API_KEY) {
      console.log('🧠 Step 6: Testing Gemini AI Coach feedback...');
      const review = await reviewCodeWithGemini({
        code: 'function add(a, b) { return a + b; }',
        language: 'javascript',
        problem: createdProblem
      });
      console.log('✅ Gemini review complete. Summary preview:', review.summary);
    } else {
      console.log('⚠️ Step 6: Skipping Gemini feedback (GEMINI_API_KEY not configured).');
    }

    console.log('🎉 Integration sanity test suite completed successfully!');
  } catch (error) {
    console.error('❌ Sanity test failed with error:', error);
    process.exit(1);
  } finally {
    // Cleanup
    console.log('🧹 Cleaning up test database records...');
    try {
      if (createdUser) {
        await User.deleteOne({ _id: createdUser._id });
        console.log('✅ Temporary user record deleted.');
      }
      if (createdProblem) {
        await Problem.deleteOne({ _id: createdProblem._id });
        console.log('✅ Temporary problem record deleted.');
      }
    } catch (cleanupErr) {
      console.error('⚠️ Cleanup warning:', cleanupErr);
    }
    await mongoose.connection.close();
    console.log('🏁 MongoDB connection closed.');
  }
}

runSanityTest();
