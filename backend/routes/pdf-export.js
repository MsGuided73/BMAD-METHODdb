const express = require('express');
const router = express.Router();
const pdfExportService = require('../services/pdfExportService');
const knowledgeBase = require('../services/knowledgeBase');
const fileManager = require('../services/fileManager');
const { optionalAuth } = require('../middleware/auth');

/**
 * POST /api/pdf-export/document
 * Export a document to PDF from provided content
 */
router.post('/document', optionalAuth, async (req, res) => {
  try {
    const {
      content,
      title,
      projectName,
      documentType,
      metadata
    } = req.body;

    // Validate required fields
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required for PDF export'
      });
    }

    // Export to PDF
    const result = await pdfExportService.exportToPDF({
      content,
      title: title || 'BMAD Document',
      projectName: projectName || 'Unknown Project',
      documentType: documentType || 'Document',
      metadata: {
        ...metadata,
        exportedBy: req.user?.email || 'Anonymous',
        exportedAt: new Date().toISOString()
      }
    });

    if (result.success) {
      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.setHeader('Content-Length', result.size);
      
      // Send PDF buffer
      res.send(result.buffer);
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('PDF Export Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export document to PDF'
    });
  }
});

/**
 * GET /api/pdf-export/session/:sessionId/:filename
 * Export a specific session file to PDF
 */
router.get('/session/:sessionId/:filename', optionalAuth, async (req, res) => {
  try {
    const { sessionId, filename } = req.params;

    // Read file from session
    const fileData = fileManager.readGeneratedFile(sessionId, filename);
    
    if (!fileData || !fileData.success) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Extract document info from filename
    const documentType = this.extractDocumentType(filename);
    const projectName = this.extractProjectName(fileData.content) || 'Project';

    // Export to PDF
    const result = await pdfExportService.exportToPDF({
      content: fileData.content,
      title: filename.replace('.md', ''),
      projectName,
      documentType,
      metadata: {
        sessionId,
        originalFilename: filename,
        fileStats: fileData.stats,
        exportedBy: req.user?.email || 'Anonymous',
        exportedAt: new Date().toISOString()
      }
    });

    if (result.success) {
      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.setHeader('Content-Length', result.size);
      
      // Send PDF buffer
      res.send(result.buffer);
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('Session File PDF Export Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export session file to PDF'
    });
  }
});

/**
 * GET /api/pdf-export/knowledge-base/:documentId
 * Export a knowledge base document to PDF
 */
router.get('/knowledge-base/:documentId', optionalAuth, async (req, res) => {
  try {
    const { documentId } = req.params;

    // Get document from knowledge base
    const document = await knowledgeBase.getDocument(documentId);
    
    if (!document || !document.success) {
      return res.status(404).json({
        success: false,
        error: 'Document not found in knowledge base'
      });
    }

    const docData = document.document;

    // Export to PDF
    const result = await pdfExportService.exportToPDF({
      content: docData.content,
      title: `${docData.projectName} - ${docData.documentType}`,
      projectName: docData.projectName,
      documentType: docData.documentType,
      metadata: {
        ...docData.metadata,
        documentId,
        exportedBy: req.user?.email || 'Anonymous',
        exportedAt: new Date().toISOString()
      }
    });

    if (result.success) {
      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.setHeader('Content-Length', result.size);
      
      // Send PDF buffer
      res.send(result.buffer);
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('Knowledge Base PDF Export Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export knowledge base document to PDF'
    });
  }
});

/**
 * POST /api/pdf-export/template
 * Export a filled template to PDF
 */
router.post('/template', optionalAuth, async (req, res) => {
  try {
    const {
      templateName,
      filledContent,
      projectName,
      metadata
    } = req.body;

    // Validate required fields
    if (!templateName || !filledContent) {
      return res.status(400).json({
        success: false,
        error: 'Template name and filled content are required'
      });
    }

    // Map template name to document type
    const documentTypeMap = {
      'project-brief-tmpl.md': 'Project Brief',
      'prd-tmpl.md': 'Product Requirements Document',
      'architecture-tmpl.md': 'Architecture Document',
      'front-end-architecture-tmpl.md': 'Frontend Architecture Document',
      'front-end-spec-tmpl.md': 'UI/UX Specification',
      'style-guide-tmpl.md': 'Style Guide',
      'screen-inventory-tmpl.md': 'Screen Inventory',
      'component-specification-tmpl.md': 'Component Specifications',
      'story-tmpl.md': 'User Story'
    };

    const documentType = documentTypeMap[templateName] || 'BMAD Document';

    // Export to PDF
    const result = await pdfExportService.exportToPDF({
      content: filledContent,
      title: `${projectName || 'Project'} - ${documentType}`,
      projectName: projectName || 'Unknown Project',
      documentType,
      metadata: {
        ...metadata,
        templateName,
        exportedBy: req.user?.email || 'Anonymous',
        exportedAt: new Date().toISOString()
      }
    });

    if (result.success) {
      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.setHeader('Content-Length', result.size);
      
      // Send PDF buffer
      res.send(result.buffer);
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('Template PDF Export Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export template to PDF'
    });
  }
});

/**
 * GET /api/pdf-export/health
 * Health check for PDF export service
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'PDF Export Service',
    status: 'operational',
    timestamp: new Date().toISOString(),
    supportedFormats: ['PDF'],
    supportedDocuments: [
      'Project Brief',
      'Product Requirements Document',
      'Architecture Document',
      'Frontend Architecture Document',
      'UI/UX Specification',
      'Style Guide',
      'Screen Inventory',
      'Component Specifications',
      'User Story'
    ]
  });
});

/**
 * Helper function to extract document type from filename
 */
function extractDocumentType(filename) {
  const typeMap = {
    'project-brief': 'Project Brief',
    'prd': 'Product Requirements Document',
    'architecture': 'Architecture Document',
    'frontend-architecture': 'Frontend Architecture Document',
    'uiux-specification': 'UI/UX Specification',
    'style-guide': 'Style Guide',
    'screen-inventory': 'Screen Inventory',
    'component-specification': 'Component Specifications',
    'story': 'User Story'
  };

  for (const [key, value] of Object.entries(typeMap)) {
    if (filename.toLowerCase().includes(key)) {
      return value;
    }
  }

  return 'BMAD Document';
}

/**
 * Helper function to extract project name from content
 */
function extractProjectName(content) {
  // Try to extract project name from common patterns
  const patterns = [
    /# (.+?) - /,
    /Project: (.+)/,
    /Project Name: (.+)/,
    /# (.+?) Project/,
    /# (.+?) (Project Brief|PRD|Architecture|Style Guide)/
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

module.exports = router;
