import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: function() { return !this.googleId; },
    select: false,   // 🔐 IMPORTANT
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple nulls
  },
  role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
  avatar: { type: String, default: '' },
  solvedProblems: [{
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
    solvedAt: { type: Date, default: Date.now },
  }],
  submissions: [{
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
    date: { type: Date, default: Date.now },
  }],
  activityByDate: [{
    date: { type: String, required: true },
    count: { type: Number, default: 0 },
  }],
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastSolvedDate: { type: Date },
  },
  externalProfiles: {
    leetcode: {
      username: { type: String, default: '' },
      solved: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
    },
    codeforces: {
      username: { type: String, default: '' },
      rating: { type: Number, default: 0 },
      maxRating: { type: Number, default: 0 },
    },
    codechef: {
      username: { type: String, default: '' },
      rating: { type: Number, default: 0 },
    },
  },
  badges: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    icon: { type: String, required: true },
    description: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now }
  }],
  dailyChallengeCompleted: [{
    date: { type: String, required: true }
  }],
}, {
  timestamps: true,
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });

userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
