const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const sessionsDir = path.join(__dirname, '../data/sessions');

// Ensure sessions directory exists
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
}

/**
 * Session structure:
 * {
 *   id: string,
 *   projectName: string,
 *   createdAt: string,
 *   updatedAt: string,
 *   currentPhase: string,
 *   phases: {
 *     analyst: { completed: boolean, data: {}, outputs: [] },
 *     pm: { completed: boolean, data: {}, outputs: [] },
 *     architect: { completed: boolean, data: {}, outputs: [] },
 *     designArchitect: { completed: boolean, data: {}, outputs: [] },
 *     po: { completed: boolean, data: {}, outputs: [] },
 *     sm: { completed: boolean, data: {}, outputs: [] }
 *   },
 *   globalData: {},
 *   generatedFiles: []
 * }
 */

/**
 * POST /api/sessions
 * Create a new planning session
 */
router.post('/', (req, res) => {
  try {
    const { projectName } = req.body;
    
    if (!projectName || typeof projectName !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Project name is required'
      });
    }
    
    const sessionId = uuidv4();
    const session = {
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
    
    // Save session
    const sessionPath = path.join(sessionsDir, `${sessionId}.json`);
    fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));
    
    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create session',
      message: error.message
    });
  }
});

/**
 * GET /api/sessions/:sessionId
 * Get session by ID
 */
router.get('/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionPath = path.join(sessionsDir, `${sessionId}.json`);
    
    if (!fs.existsSync(sessionPath)) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    const session = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
    
    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session',
      message: error.message
    });
  }
});

/**
 * PUT /api/sessions/:sessionId
 * Update session data
 */
router.put('/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const updates = req.body;
    
    const sessionPath = path.join(sessionsDir, `${sessionId}.json`);
    
    if (!fs.existsSync(sessionPath)) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    const session = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
    
    // Update session with provided data
    Object.assign(session, updates, {
      updatedAt: new Date().toISOString()
    });
    
    // Save updated session
    fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));
    
    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update session',
      message: error.message
    });
  }
});

/**
 * POST /api/sessions/:sessionId/phases/:phase/complete
 * Mark a phase as completed and save its data
 */
router.post('/:sessionId/phases/:phase/complete', (req, res) => {
  try {
    const { sessionId, phase } = req.params;
    const { data, outputs } = req.body;
    
    const sessionPath = path.join(sessionsDir, `${sessionId}.json`);
    
    if (!fs.existsSync(sessionPath)) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    const session = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
    
    // Validate phase
    if (!session.phases[phase]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phase'
      });
    }
    
    // Update phase data
    session.phases[phase] = {
      completed: true,
      data: data || {},
      outputs: outputs || [],
      completedAt: new Date().toISOString()
    };
    
    // Update global data with phase data
    if (data) {
      Object.assign(session.globalData, data);
    }
    
    // Determine next phase
    const phaseOrder = ['analyst', 'pm', 'architect', 'designArchitect', 'po', 'sm'];
    const currentIndex = phaseOrder.indexOf(phase);
    const nextPhase = currentIndex < phaseOrder.length - 1 ? phaseOrder[currentIndex + 1] : null;
    
    session.currentPhase = nextPhase;
    session.updatedAt = new Date().toISOString();
    
    // Save updated session
    fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));
    
    res.json({
      success: true,
      data: session,
      nextPhase
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to complete phase',
      message: error.message
    });
  }
});

/**
 * GET /api/sessions
 * Get all sessions (for admin/debugging)
 */
router.get('/', (req, res) => {
  try {
    const sessions = fs.readdirSync(sessionsDir)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const session = JSON.parse(fs.readFileSync(path.join(sessionsDir, file), 'utf8'));
        return {
          id: session.id,
          projectName: session.projectName,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          currentPhase: session.currentPhase,
          completedPhases: Object.keys(session.phases).filter(phase => session.phases[phase].completed)
        };
      })
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sessions',
      message: error.message
    });
  }
});

/**
 * DELETE /api/sessions/:sessionId
 * Delete a session
 */
router.delete('/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionPath = path.join(sessionsDir, `${sessionId}.json`);
    
    if (!fs.existsSync(sessionPath)) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    fs.unlinkSync(sessionPath);
    
    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete session',
      message: error.message
    });
  }
});

module.exports = router;
