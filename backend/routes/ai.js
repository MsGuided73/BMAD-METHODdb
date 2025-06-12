const express = require('express');
const router = express.Router();
const AIOrchestrator = require('../services/aiOrchestrator');
const FileManager = require('../services/fileManager');
const KnowledgeBaseService = require('../services/knowledgeBase');

// Initialize AI Orchestrator, File Manager, and Knowledge Base
const aiOrchestrator = new AIOrchestrator();
const fileManager = new FileManager();
const knowledgeBase = new KnowledgeBaseService();

// Initialize with API key from environment
if (process.env.GEMINI_API_KEY) {
  aiOrchestrator.initialize(process.env.GEMINI_API_KEY)
    .catch(error => console.error('Failed to initialize AI Orchestrator:', error));
}

/**
 * POST /api/ai/chat
 * Chat with an AI agent for a specific phase
 */
router.post('/chat', async (req, res) => {
  try {
    const { agentId, phase, message, context, sessionId } = req.body;

    if (!agentId || !phase || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: agentId, phase, message'
      });
    }

    if (!aiOrchestrator.isReady()) {
      return res.status(503).json({
        success: false,
        error: 'AI service not available. Please check API key configuration.'
      });
    }

    // Enhance context with sessionId for full document access
    const enhancedContext = {
      ...context,
      sessionId
    };

    const result = await aiOrchestrator.chatWithAgent(agentId, phase, message, enhancedContext);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      error: 'AI chat failed',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/generate-template
 * Generate template content using AI and save immediately as .md file
 */
router.post('/generate-template', async (req, res) => {
  try {
    const { templateName, agentId, context, sessionId } = req.body;

    if (!templateName || !agentId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: templateName, agentId'
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'sessionId is required for file generation'
      });
    }

    if (!aiOrchestrator.isReady()) {
      return res.status(503).json({
        success: false,
        error: 'AI service not available. Please check API key configuration.'
      });
    }

    // Enhance context with sessionId for file generation
    const enhancedContext = {
      ...context,
      sessionId
    };

    const result = await aiOrchestrator.generateTemplateContent(templateName, agentId, enhancedContext);

    // Auto-save to knowledge base for voice agent
    if (result.content) {
      try {
        const kbResult = await knowledgeBase.saveDocument({
          sessionId: sessionId,
          projectName: enhancedContext.projectName || 'Generated Project',
          phase: enhancedContext.currentPhase || 'unknown',
          documentType: templateName,
          content: result.content,
          metadata: {
            agentId,
            templateName,
            generatedAt: new Date().toISOString(),
            isGenerated: true,
            filename: result.savedFile?.filename
          }
        });

        console.log(`📚 Auto-saved to knowledge base: ${kbResult.success ? 'Success' : 'Failed'}`);
      } catch (kbError) {
        console.error('Knowledge base auto-save failed:', kbError);
        // Don't fail the main request if KB save fails
      }
    }

    res.json({
      success: true,
      data: result,
      message: result.savedFile ? `Template generated and saved as ${result.savedFile.filename}` : 'Template generated'
    });
  } catch (error) {
    console.error('Template generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Template generation failed',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/suggestions
 * Get AI suggestions for next steps
 */
router.post('/suggestions', async (req, res) => {
  try {
    const { agentId, phase, currentData } = req.body;

    if (!agentId || !phase) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: agentId, phase'
      });
    }

    if (!aiOrchestrator.isReady()) {
      return res.status(503).json({
        success: false,
        error: 'AI service not available. Please check API key configuration.'
      });
    }

    const result = await aiOrchestrator.getAgentSuggestions(agentId, phase, currentData);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('AI suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'AI suggestions failed',
      message: error.message
    });
  }
});

/**
 * GET /api/ai/status
 * Check AI service status
 */
router.get('/status', (req, res) => {
  const isReady = aiOrchestrator.isReady();
  const hasApiKey = !!process.env.GEMINI_API_KEY;

  res.json({
    success: true,
    data: {
      ready: isReady,
      hasApiKey,
      service: 'Gemini 2.5 Pro',
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * POST /api/ai/initialize
 * Initialize AI service with API key (for runtime configuration)
 */
router.post('/initialize', async (req, res) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required'
      });
    }

    await aiOrchestrator.initialize(apiKey);

    res.json({
      success: true,
      message: 'AI Orchestrator initialized successfully',
      data: {
        ready: true,
        service: 'Gemini 2.5 Pro'
      }
    });
  } catch (error) {
    console.error('AI initialization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize AI service',
      message: error.message
    });
  }
});

/**
 * GET /api/ai/sessions/:sessionId/files
 * Get list of generated files for a session
 */
router.get('/sessions/:sessionId/files', (req, res) => {
  try {
    const { sessionId } = req.params;
    const files = fileManager.listSessionFiles(sessionId);

    res.json({
      success: true,
      data: files,
      count: files.length
    });
  } catch (error) {
    console.error('Error listing session files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list session files',
      message: error.message
    });
  }
});

/**
 * GET /api/ai/sessions/:sessionId/files/:filename
 * Get content of a specific generated file
 */
router.get('/sessions/:sessionId/files/:filename', (req, res) => {
  try {
    const { sessionId, filename } = req.params;
    const fileData = fileManager.readGeneratedFile(sessionId, filename);

    if (!fileData) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    res.json({
      success: true,
      data: fileData
    });
  } catch (error) {
    console.error('Error reading session file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to read session file',
      message: error.message
    });
  }
});

/**
 * GET /api/ai/sessions/:sessionId/context
 * Get full document context for a session
 */
router.get('/sessions/:sessionId/context', (req, res) => {
  try {
    const { sessionId } = req.params;
    const context = fileManager.getSessionContext(sessionId);

    res.json({
      success: true,
      data: context,
      documentCount: Object.keys(context).length
    });
  } catch (error) {
    console.error('Error getting session context:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get session context',
      message: error.message
    });
  }
});

module.exports = router;
