const express = require('express');
const { optionalAuth, requireAuth } = require('../middleware/auth');
const KnowledgeBaseService = require('../services/knowledgeBase');

const router = express.Router();
const knowledgeBase = new KnowledgeBaseService();

/**
 * POST /api/knowledge-base/documents
 * Save a document to the knowledge base
 */
router.post('/documents', optionalAuth, async (req, res) => {
  try {
    const {
      sessionId,
      projectName,
      phase,
      documentType,
      content,
      metadata
    } = req.body;

    // Validate required fields
    if (!sessionId || !phase || !documentType || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId, phase, documentType, content'
      });
    }

    // Add user context if authenticated
    const enrichedMetadata = {
      ...metadata,
      userId: req.user?.id,
      userEmail: req.user?.email,
      isAuthenticated: req.isAuthenticated || false
    };

    const result = await knowledgeBase.saveDocument({
      sessionId,
      projectName,
      phase,
      documentType,
      content,
      metadata: enrichedMetadata
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Document saved to knowledge base',
        documentId: result.documentId
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('Knowledge base save error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save document to knowledge base'
    });
  }
});

/**
 * GET /api/knowledge-base/projects/:sessionId
 * Get all documents for a specific project/session
 */
router.get('/projects/:sessionId', optionalAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const result = await knowledgeBase.getProjectDocuments(sessionId);
    
    if (result.success) {
      res.json({
        success: true,
        sessionId,
        documents: result.documents
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('Get project documents error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve project documents'
    });
  }
});

/**
 * GET /api/knowledge-base/search
 * Search documents in the knowledge base
 */
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q: query, phase, documentType, projectName } = req.query;
    
    const filters = {};
    if (phase) filters.phase = phase;
    if (documentType) filters.documentType = documentType;
    if (projectName) filters.projectName = projectName;

    const result = await knowledgeBase.searchDocuments(query, filters);
    
    if (result.success) {
      res.json({
        success: true,
        query,
        filters,
        results: result.results,
        count: result.results.length
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('Search documents error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search documents'
    });
  }
});

/**
 * POST /api/knowledge-base/sync-templates
 * Sync all existing templates to knowledge base for voice agent
 */
router.post('/sync-templates', optionalAuth, async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const templatesDir = path.join(__dirname, '../data/templates');
    const templateFiles = fs.readdirSync(templatesDir).filter(f => f.endsWith('.md'));
    
    let syncedCount = 0;
    const errors = [];

    for (const templateFile of templateFiles) {
      try {
        const templatePath = path.join(templatesDir, templateFile);
        const content = fs.readFileSync(templatePath, 'utf8');
        
        const result = await knowledgeBase.saveDocument({
          sessionId: 'template-sync',
          projectName: 'BMAD Templates',
          phase: 'template',
          documentType: 'template',
          content,
          metadata: {
            templateName: templateFile,
            syncedAt: new Date().toISOString(),
            isTemplate: true
          }
        });

        if (result.success) {
          syncedCount++;
        } else {
          errors.push(`${templateFile}: ${result.error}`);
        }

      } catch (error) {
        errors.push(`${templateFile}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `Synced ${syncedCount} templates to knowledge base`,
      syncedCount,
      totalTemplates: templateFiles.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Template sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync templates to knowledge base'
    });
  }
});

/**
 * GET /api/knowledge-base/stats
 * Get knowledge base statistics
 */
router.get('/stats', optionalAuth, async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const docsDir = path.join(__dirname, '../data/knowledge-base/generated-docs');
    const projectsDir = path.join(__dirname, '../data/knowledge-base/projects');
    
    let totalDocuments = 0;
    let totalProjects = 0;
    let totalWords = 0;
    const phaseStats = {};
    const documentTypeStats = {};

    // Count documents
    if (fs.existsSync(docsDir)) {
      const docFiles = fs.readdirSync(docsDir).filter(f => f.endsWith('.json'));
      totalDocuments = docFiles.length;

      // Analyze document content
      for (const file of docFiles) {
        try {
          const content = fs.readFileSync(path.join(docsDir, file), 'utf8');
          const doc = JSON.parse(content);
          
          totalWords += doc.metadata?.wordCount || 0;
          
          phaseStats[doc.phase] = (phaseStats[doc.phase] || 0) + 1;
          documentTypeStats[doc.documentType] = (documentTypeStats[doc.documentType] || 0) + 1;
        } catch (error) {
          // Skip invalid files
        }
      }
    }

    // Count projects
    if (fs.existsSync(projectsDir)) {
      const projectFiles = fs.readdirSync(projectsDir).filter(f => f.endsWith('.json'));
      totalProjects = projectFiles.length;
    }

    res.json({
      success: true,
      stats: {
        totalDocuments,
        totalProjects,
        totalWords,
        averageWordsPerDocument: totalDocuments > 0 ? Math.round(totalWords / totalDocuments) : 0,
        phaseDistribution: phaseStats,
        documentTypeDistribution: documentTypeStats,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve knowledge base statistics'
    });
  }
});

module.exports = router;
