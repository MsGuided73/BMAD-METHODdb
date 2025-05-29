const express = require('express');
const router = express.Router();
const TemplateParser = require('../utils/templateParser');

const templateParser = new TemplateParser();

/**
 * GET /api/templates
 * Get all available templates
 */
router.get('/', (req, res) => {
  try {
    const templates = templateParser.getAvailableTemplates();
    res.json({
      success: true,
      data: templates,
      count: templates.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates',
      message: error.message
    });
  }
});

/**
 * GET /api/templates/:templateName/schema
 * Get form schema for a specific template
 */
router.get('/:templateName/schema', (req, res) => {
  try {
    const { templateName } = req.params;
    const schema = templateParser.parseTemplate(templateName);
    
    res.json({
      success: true,
      data: schema
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'Template not found or parsing failed',
      message: error.message
    });
  }
});

/**
 * POST /api/templates/:templateName/fill
 * Fill template with provided values
 */
router.post('/:templateName/fill', (req, res) => {
  try {
    const { templateName } = req.params;
    const { values } = req.body;
    
    if (!values || typeof values !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        message: 'Values object is required'
      });
    }
    
    const filledContent = templateParser.fillTemplate(templateName, values);
    
    res.json({
      success: true,
      data: {
        templateName,
        content: filledContent,
        values
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fill template',
      message: error.message
    });
  }
});

/**
 * GET /api/templates/:templateName/raw
 * Get raw template content
 */
router.get('/:templateName/raw', (req, res) => {
  try {
    const { templateName } = req.params;
    const fs = require('fs');
    const path = require('path');
    
    const templatePath = path.join(__dirname, '../data/templates', templateName);
    const content = fs.readFileSync(templatePath, 'utf8');
    
    res.json({
      success: true,
      data: {
        templateName,
        content
      }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'Template not found',
      message: error.message
    });
  }
});

/**
 * GET /api/templates/by-phase/:phase
 * Get templates for a specific BMAD phase
 */
router.get('/by-phase/:phase', (req, res) => {
  try {
    const { phase } = req.params;
    const allTemplates = templateParser.getAvailableTemplates();
    
    // Map phases to template patterns
    const phaseTemplateMap = {
      'analyst': ['project-brief'],
      'pm': ['prd', 'product-requirements'],
      'architect': ['architecture-document'],
      'design-architect': ['frontend-architecture', 'uiux-specification'],
      'po': ['story'],
      'sm': ['story']
    };
    
    const patterns = phaseTemplateMap[phase.toLowerCase()] || [];
    const filteredTemplates = allTemplates.filter(template => 
      patterns.some(pattern => 
        template.name.toLowerCase().includes(pattern)
      )
    );
    
    res.json({
      success: true,
      data: filteredTemplates,
      phase,
      count: filteredTemplates.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates for phase',
      message: error.message
    });
  }
});

module.exports = router;
