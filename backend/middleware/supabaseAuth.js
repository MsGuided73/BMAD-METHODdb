const { supabaseAdmin } = require('../config/supabase');

// Verify Supabase JWT token
const verifySupabaseToken = async (token) => {
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error) throw error;
    return user;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Authentication middleware - optional (allows both authenticated and anonymous users)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const user = await verifySupabaseToken(token);
      
      if (user) {
        // Get user profile from our users table
        const { data: profile, error } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (!error && profile && profile.is_active) {
          req.user = { ...user, ...profile };
          req.isAuthenticated = true;
        }
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
    const user = await verifySupabaseToken(token);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. User not found.'
      });
    }
    
    // Get user profile from our users table
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error || !profile || !profile.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. User not found or inactive.'
      });
    }
    
    req.user = { ...user, ...profile };
    req.isAuthenticated = true;
    next();
  } catch (error) {
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
    
    const isTrialActive = req.user.subscription_status === 'trial' && new Date() < new Date(req.user.trial_end_date);
    const isSubscriptionActive = req.user.subscription_status === 'active';
    
    if (!isTrialActive && !isSubscriptionActive) {
      const daysLeft = Math.max(0, Math.ceil((new Date(req.user.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24)));
      
      return res.status(403).json({
        success: false,
        error: 'Subscription required.',
        message: req.user.subscription_status === 'trial' 
          ? `Your free trial has expired. Please upgrade to continue.`
          : 'Your subscription has expired. Please renew to continue.',
        subscriptionStatus: req.user.subscription_status,
        daysLeftInTrial: daysLeft
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Subscription check failed.'
    });
  }
};

// Check trial status and add warning headers
const checkTrialStatus = async (req, res, next) => {
  try {
    if (req.user && req.user.subscription_status === 'trial') {
      const daysLeft = Math.max(0, Math.ceil((new Date(req.user.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24)));
      
      // Add trial status to response headers
      res.set({
        'X-Trial-Days-Left': daysLeft.toString(),
        'X-Trial-Status': daysLeft > 0 ? 'active' : 'expired',
        'X-Subscription-Status': req.user.subscription_status
      });
      
      // Add trial info to request for use in responses
      req.trialInfo = {
        daysLeft,
        isActive: daysLeft > 0,
        status: req.user.subscription_status
      };
    }
    
    next();
  } catch (error) {
    next(); // Don't fail the request if trial check fails
  }
};

module.exports = {
  optionalAuth,
  requireAuth,
  requireActiveSubscription,
  checkTrialStatus,
  verifySupabaseToken
};
