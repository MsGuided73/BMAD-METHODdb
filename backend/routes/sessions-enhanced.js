const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { User, Session } = require('../models');
const { optionalAuth, requireAuth, checkTrialStatus, requireActiveSubscription } = require('../middleware/auth');

const router = express.Router();

// Ensure sessions directory exists (for backward compatibility)
const sessionsDir = path.join(__dirname, '../data/sessions');
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
}

/**
 * POST /api/sessions
 * Create a new planning session (supports both authenticated and anonymous users)
 */
router.post('/', optionalAuth, checkTrialStatus, async (req, res) => {
  try {
    const { projectName, description } = req.body;
    
    if (!projectName || typeof projectName !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Project name is required'
      });
    }

    // Check if authenticated user has active subscription for new sessions
    if (req.isAuthenticated && !req.user.isSubscriptionActive()) {
      return res.status(403).json({
        success: false,
        error: 'Active subscription required to create new sessions',
        subscriptionStatus: req.user.subscriptionStatus,
        daysLeftInTrial: req.user.getDaysLeftInTrial()
      });
    }

    let session;

    if (req.isAuthenticated) {
      // Create database session for authenticated users
      session = await Session.create({
        userId: req.user.id,
        projectName: projectName.trim(),
        description: description?.trim(),
        globalData: {
          projectName: projectName.trim()
        }
      });
    } else {
      // Create file-based session for anonymous users (backward compatibility)
      const sessionId = uuidv4();
      session = {
        id: sessionId,
        projectName: projectName.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currentPhase: 'analyst',
        phases: {
          analyst: { completed: false, data: {}, outputs: [] },
          pm: { completed: false, data: {}, outputs: [] },
          architect: { completed: false, data: {}, outputs: [] },
          designArchitect: { completed: false, data: {}, outputs: [] },
          po: { completed: false, data: {}, outputs: [] },
          sm: { completed: false, data: {}, outputs: [] }
        },
        globalData: {
          projectName: projectName.trim()
        },
        generatedFiles: []
      };
      
      // Save to file
      const sessionPath = path.join(sessionsDir, `${sessionId}.json`);
      fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));
    }
    
    res.json({
      success: true,
      data: session,
      ...(req.trialInfo && { trial: req.trialInfo })
    });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create session',
      message: error.message
    });
  }
});

/**
 * GET /api/sessions
 * Get user's sessions (authenticated) or all file sessions (anonymous)
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    let sessions = [];

    if (req.isAuthenticated) {
      // Get user's database sessions
      sessions = await Session.findAll({
        where: { 
          userId: req.user.id,
          status: ['active', 'completed'] // Exclude deleted sessions
        },
        order: [['updatedAt', 'DESC']],
        limit: 50 // Limit for performance
      });
    } else {
      // Get file-based sessions (for backward compatibility)
      sessions = fs.readdirSync(sessionsDir)
        .filter(file => file.endsWith('.json'))
        .map(file => {
          try {
            const session = JSON.parse(fs.readFileSync(path.join(sessionsDir, file), 'utf8'));
            return {
              id: session.id,
              projectName: session.projectName,
              createdAt: session.createdAt,
              updatedAt: session.updatedAt,
              currentPhase: session.currentPhase,
              completedPhases: Object.keys(session.phases).filter(phase => session.phases[phase].completed)
            };
          } catch (error) {
            console.error(`Error reading session file ${file}:`, error);
            return null;
          }
        })
        .filter(session => session !== null)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 20); // Limit for performance
    }
    
    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    console.error('Sessions fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sessions',
      message: error.message
    });
  }
});

/**
 * GET /api/sessions/:sessionId
 * Get session by ID (supports both database and file sessions)
 */
router.get('/:sessionId', optionalAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    let session = null;

    // Try database first if user is authenticated
    if (req.isAuthenticated) {
      session = await Session.findOne({
        where: { 
          id: sessionId,
          userId: req.user.id // Ensure user can only access their own sessions
        }
      });
      
      if (session) {
        await session.updateLastAccessed();
      }
    }

    // Fallback to file-based session if not found in database
    if (!session) {
      const sessionPath = path.join(sessionsDir, `${sessionId}.json`);
      
      if (fs.existsSync(sessionPath)) {
        session = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
      }
    }

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Session fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session',
      message: error.message
    });
  }
});

module.exports = router;
