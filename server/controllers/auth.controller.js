import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const COOKIE_NAME = 'auth_token';

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
};

const setAuthCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, getCookieOptions());
};

const clearAuthCookie = (res) => {
  res.clearCookie(COOKIE_NAME, {
    ...getCookieOptions(),
    maxAge: undefined,
  });
};

export const signup = async (req, res) => {
  const startTime = Date.now();

  try {
    console.log('📝 Signup attempt:', {
      email: req.body.email,
      username: req.body.username,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      console.warn('⚠️ Signup validation failed - missing fields:', {
        hasUsername: !!username,
        hasEmail: !!email,
        hasPassword: !!password
      });
      return res.status(400).json({ message: 'Username, email and password are required' });
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      console.warn('⚠️ Signup validation failed - invalid username format:', username);
      return res.status(400).json({ message: 'Username can only contain letters, numbers, and underscores' });
    }

    if (username.length < 3 || username.length > 30) {
      console.warn('⚠️ Signup validation failed - username length:', username.length);
      return res.status(400).json({ message: 'Username must be between 3 and 30 characters' });
    }

    console.log('🔍 Checking for existing user...');
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.warn('⚠️ Signup failed - email already exists:', email);
      return res.status(400).json({ message: 'Email already exists' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      console.warn('⚠️ Signup failed - username already exists:', username);
      return res.status(400).json({ message: 'Username already exists' });
    }

    console.log('💾 Creating new user...');
    const user = new User({ username, email, password });
    await user.save();

    console.log('🔐 Generating JWT token...');
    const token = generateToken(user._id);
    setAuthCookie(res, token);

    const duration = Date.now() - startTime;
    console.log('✅ Signup successful:', {
      userId: user._id,
      username: user.username,
      duration: `${duration}ms`
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Signup error:', {
      error: error.message,
      stack: error.stack,
      code: error.code,
      email: req.body.email,
      username: req.body.username,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      console.warn('⚠️ Duplicate key error:', { field, value: error.keyValue });
      return res.status(400).json({ message: `${field} already exists` });
    }

    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const login = async (req, res) => {
  const startTime = Date.now();

  try {
    console.log('🔑 Login attempt:', {
      email: req.body.email,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    const { email, password } = req.body;

    if (!email || !password) {
      console.warn('⚠️ Login validation failed - missing fields:', {
        hasEmail: !!email,
        hasPassword: !!password
      });
      return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log('🔍 Finding user...');
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.warn('⚠️ Login failed - user not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('🔐 Verifying password...');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.warn('⚠️ Login failed - invalid password for user:', user._id);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('🔐 Generating JWT token...');
    const token = generateToken(user._id);
    setAuthCookie(res, token);

    const duration = Date.now() - startTime;
    console.log('✅ Login successful:', {
      userId: user._id,
      username: user.username,
      duration: `${duration}ms`
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Login error:', {
      error: error.message,
      stack: error.stack,
      email: req.body.email,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

export const logout = async (req, res) => {
  try {
    clearAuthCookie(res);
    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

export const googleLogin = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: 'Missing ID token' });
  
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    
    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        // Link existing email account to googleId using updateOne to bypass full-doc validation
        await User.updateOne({ _id: user._id }, { $set: { googleId, avatar: picture || user.avatar } });
        user = await User.findById(user._id);
      } else {
        // Create new user
        const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
        let username = baseUsername;
        let counter = 1;
        while (await User.findOne({ username })) {
          username = `${baseUsername}${counter}`;
          counter++;
        }
        user = new User({
          googleId,
          email,
          username,
          avatar: picture
        });
        await user.save();
      }
    }
    
    const token = generateToken(user._id);
    setAuthCookie(res, token);
    
    res.json({
      message: 'Google login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ message: 'Invalid Google token' });
  }
};
