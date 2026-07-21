import authRoutes from '../routes/auth.routes.js';
import problemRoutes from '../routes/problem.routes.js';
import submissionRoutes from '../routes/submission.routes.js';
import commentRoutes from '../routes/comment.routes.js';
import userRoutes from '../routes/user.routes.js';
import dashboardRoutes from '../routes/dashboard.routes.js';
import aiRoutes from '../routes/ai.routes.js';
import leaderboardRoutes from '../routes/leaderboard.routes.js';
import contestRoutes from '../routes/contest.routes.js';

export const setupRoutes = (app) => {
  try {
    // Mount routes with error handling
    app.use('/api/auth', (req, res, next) => {
      console.log('🔐 Auth route accessed:', req.method, req.url);
      next();
    }, authRoutes);

    app.use('/api/problems', (req, res, next) => {
      console.log('📚 Problems route accessed:', req.method, req.url);
      next();
    }, problemRoutes);

    app.use('/api/submissions', (req, res, next) => {
      console.log('📤 Submissions route accessed:', req.method, req.url);
      next();
    }, submissionRoutes);

    app.use('/api/comments', (req, res, next) => {
      console.log('💬 Comments route accessed:', req.method, req.url);
      next();
    }, commentRoutes);

    app.use('/api/users', (req, res, next) => {
      console.log('👤 Users route accessed:', req.method, req.url);
      next();
    }, userRoutes);

    app.use('/api/dashboard', (req, res, next) => {
      console.log('📊 Dashboard route accessed:', req.method, req.url);
      next();
    }, dashboardRoutes);

    app.use('/api/ai', (req, res, next) => {
      console.log('🤖 AI route accessed:', req.method, req.url);
      next();
    }, aiRoutes);

    app.use('/api/leaderboard', (req, res, next) => {
      console.log('🏆 Leaderboard route accessed:', req.method, req.url);
      next();
    }, leaderboardRoutes);

    app.use('/api/contests', (req, res, next) => {
      console.log('🏁 Contests route accessed:', req.method, req.url);
      next();
    }, contestRoutes);

    // Health check with detailed logging
    app.get('/api/health', (req, res) => {
      console.log('🏥 Health check requested');
      res.json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
      });
    });

    console.log('✅ All routes mounted successfully');

  } catch (error) {
    console.error('❌ Error setting up routes:', error);
    throw error;
  }
};
