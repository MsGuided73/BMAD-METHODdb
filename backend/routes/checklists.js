const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const checklistsDir = path.join(__dirname, '../data/checklists');

/**
 * Parse checklist content into structured format
 */
function parseChecklist(content) {
  const lines = content.split('\n');
  const checklist = {
    title: '',
    description: '',
    sections: [],
    items: []
  };
  
  let currentSection = null;
  let inDescription = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('# ')) {
      checklist.title = trimmed.replace('# ', '');
      inDescription = true;
    } else if (trimmed.startsWith('## ')) {
      // Save previous section
      if (currentSection) {
        checklist.sections.push(currentSection);
      }
      
      // Start new section
      currentSection = {
        title: trimmed.replace('## ', ''),
        items: []
      };
      inDescription = false;
    } else if (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]')) {
      // Checklist item
      const isChecked = trimmed.startsWith('- [x]');
      const text = trimmed.replace(/^- \[[x ]\] /, '');
      
      const item = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text,
        checked: isChecked,
        required: true
      };
      
      if (currentSection) {
        currentSection.items.push(item);
      } else {
        checklist.items.push(item);
      }
    } else if (inDescription && trimmed && !trimmed.startsWith('#')) {
      checklist.description += (checklist.description ? '\n' : '') + trimmed;
    }
  }
  
  // Save last section
  if (currentSection) {
    checklist.sections.push(currentSection);
  }
  
  return checklist;
}

/**
 * GET /api/checklists
 * Get all available checklists
 */
router.get('/', (req, res) => {
  try {
    const checklists = fs.readdirSync(checklistsDir)
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const content = fs.readFileSync(path.join(checklistsDir, file), 'utf8');
        const parsed = parseChecklist(content);
        
        return {
          name: file,
          title: parsed.title || file.replace('.md', '').replace(/-/g, ' '),
          description: parsed.description,
          itemCount: parsed.items.length + parsed.sections.reduce((sum, section) => sum + section.items.length, 0),
          path: file
        };
      });
    
    res.json({
      success: true,
      data: checklists,
      count: checklists.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch checklists',
      message: error.message
    });
  }
});

/**
 * GET /api/checklists/:checklistName
 * Get specific checklist with full structure
 */
router.get('/:checklistName', (req, res) => {
  try {
    const { checklistName } = req.params;
    const checklistPath = path.join(checklistsDir, checklistName);
    
    if (!fs.existsSync(checklistPath)) {
      return res.status(404).json({
        success: false,
        error: 'Checklist not found'
      });
    }
    
    const content = fs.readFileSync(checklistPath, 'utf8');
    const parsed = parseChecklist(content);
    
    res.json({
      success: true,
      data: {
        name: checklistName,
        ...parsed,
        rawContent: content
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch checklist',
      message: error.message
    });
  }
});

/**
 * POST /api/checklists/:checklistName/validate
 * Validate checklist completion
 */
router.post('/:checklistName/validate', (req, res) => {
  try {
    const { checklistName } = req.params;
    const { responses } = req.body;
    
    if (!responses || typeof responses !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        message: 'Responses object is required'
      });
    }
    
    // Get checklist structure
    const checklistPath = path.join(checklistsDir, checklistName);
    const content = fs.readFileSync(checklistPath, 'utf8');
    const parsed = parseChecklist(content);
    
    // Calculate completion stats
    const allItems = [
      ...parsed.items,
      ...parsed.sections.flatMap(section => section.items)
    ];
    
    const totalItems = allItems.length;
    const completedItems = Object.values(responses).filter(Boolean).length;
    const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    const validation = {
      checklistName,
      totalItems,
      completedItems,
      completionPercentage,
      isComplete: completionPercentage === 100,
      responses,
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to validate checklist',
      message: error.message
    });
  }
});

/**
 * GET /api/checklists/by-phase/:phase
 * Get checklists for a specific BMAD phase
 */
router.get('/by-phase/:phase', (req, res) => {
  try {
    const { phase } = req.params;
    
    // Map phases to checklist patterns
    const phaseChecklistMap = {
      'analyst': ['brainstorming', 'research'],
      'pm': ['product-manager', 'requirements'],
      'architect': ['architect', 'solution-validation'],
      'design-architect': ['frontend-architecture'],
      'po': ['product-owner', 'validation'],
      'sm': ['story', 'definition-of-done']
    };
    
    const patterns = phaseChecklistMap[phase.toLowerCase()] || [];
    
    const allChecklists = fs.readdirSync(checklistsDir)
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const content = fs.readFileSync(path.join(checklistsDir, file), 'utf8');
        const parsed = parseChecklist(content);
        
        return {
          name: file,
          title: parsed.title || file.replace('.md', '').replace(/-/g, ' '),
          description: parsed.description,
          itemCount: parsed.items.length + parsed.sections.reduce((sum, section) => sum + section.items.length, 0),
          path: file
        };
      });
    
    const filteredChecklists = allChecklists.filter(checklist => 
      patterns.some(pattern => 
        checklist.name.toLowerCase().includes(pattern)
      )
    );
    
    res.json({
      success: true,
      data: filteredChecklists,
      phase,
      count: filteredChecklists.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch checklists for phase',
      message: error.message
    });
  }
});

module.exports = router;
