const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'bmad-planning-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

// Authentication middleware - optional (allows both authenticated and anonymous users)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      const user = await User.findByPk(decoded.userId);
      if (user && user.isActive) {
        req.user = user;
        req.isAuthenticated = true;
      }
    }
    
    req.isAuthenticated = req.isAuthenticated || false;
    next();
  } catch (error) {
    // Don't fail for invalid tokens in optional auth
    req.isAuthenticated = false;
    next();
  }
};

// Authentication middleware - required
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. User not found or inactive.'
      });
    }
    
    req.user = user;
    req.isAuthenticated = true;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired. Please login again.'
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Invalid token.'
    });
  }
};

// Check if user has active subscription (trial or paid)
const requireActiveSubscription = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
    }
    
    if (!req.user.isSubscriptionActive()) {
      const daysLeft = req.user.getDaysLeftInTrial();
      
      return res.status(403).json({
        success: false,
        error: 'Subscription required.',
        message: req.user.subscriptionStatus === 'trial' 
          ? `Your free trial has expired. Please upgrade to continue.`
          : 'Your subscription has expired. Please renew to continue.',
        subscriptionStatus: req.user.subscriptionStatus,
        daysLeftInTrial: daysLeft
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Subscription check failed.',
      message: error.message
    });
  }
};

// Check trial status and add warning headers
const checkTrialStatus = async (req, res, next) => {
  try {
    if (req.user && req.user.subscriptionStatus === 'trial') {
      const daysLeft = req.user.getDaysLeftInTrial();
      
      // Add trial status to response headers
      res.set({
        'X-Trial-Days-Left': daysLeft.toString(),
        'X-Trial-Status': daysLeft > 0 ? 'active' : 'expired',
        'X-Subscription-Status': req.user.subscriptionStatus
      });
      
      // Add trial info to request for use in responses
      req.trialInfo = {
        daysLeft,
        isActive: daysLeft > 0,
        status: req.user.subscriptionStatus
      };
    }
    
    next();
  } catch (error) {
    next(); // Don't fail the request if trial check fails
  }
};

module.exports = {
  generateToken,
  verifyToken,
  optionalAuth,
  requireAuth,
  requireActiveSubscription,
  checkTrialStatus
};
