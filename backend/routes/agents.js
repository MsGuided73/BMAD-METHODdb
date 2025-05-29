const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const personasDir = path.join(__dirname, '../data/personas');
const tasksDir = path.join(__dirname, '../data/tasks');
const configDir = path.join(__dirname, '../data/config');

/**
 * Parse persona content to extract key information
 */
function parsePersona(content) {
  const lines = content.split('\n');
  const persona = {
    name: '',
    role: '',
    description: '',
    capabilities: [],
    tasks: [],
    expertise: [],
    workflow: []
  };
  
  let currentSection = null;
  let currentList = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('# ')) {
      persona.name = trimmed.replace('# ', '');
    } else if (trimmed.startsWith('## ')) {
      currentSection = trimmed.replace('## ', '').toLowerCase();
      currentList = null;
    } else if (trimmed.startsWith('- ')) {
      const item = trimmed.replace('- ', '');
      
      if (currentSection === 'capabilities' || currentSection === 'what you can do') {
        persona.capabilities.push(item);
      } else if (currentSection === 'tasks' || currentSection === 'available tasks') {
        persona.tasks.push(item);
      } else if (currentSection === 'expertise' || currentSection === 'areas of expertise') {
        persona.expertise.push(item);
      } else if (currentSection === 'workflow' || currentSection === 'typical workflow') {
        persona.workflow.push(item);
      }
    } else if (!trimmed.startsWith('#') && trimmed && !persona.description) {
      persona.description = trimmed;
    }
  }
  
  return persona;
}

/**
 * GET /api/agents
 * Get all available agent personas
 */
router.get('/', (req, res) => {
  try {
    const personas = fs.readdirSync(personasDir)
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const content = fs.readFileSync(path.join(personasDir, file), 'utf8');
        const parsed = parsePersona(content);
        
        // Extract role from filename
        const role = file.replace('role-', '').replace('.md', '').replace(/-/g, ' ');
        
        return {
          id: file.replace('.md', ''),
          name: parsed.name || role,
          role: role,
          description: parsed.description,
          capabilities: parsed.capabilities,
          taskCount: parsed.tasks.length,
          file: file
        };
      });
    
    res.json({
      success: true,
      data: personas,
      count: personas.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agents',
      message: error.message
    });
  }
});

/**
 * GET /api/agents/:agentId
 * Get specific agent persona with full details
 */
router.get('/:agentId', (req, res) => {
  try {
    const { agentId } = req.params;
    const personaFile = `${agentId}.md`;
    const personaPath = path.join(personasDir, personaFile);
    
    if (!fs.existsSync(personaPath)) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }
    
    const content = fs.readFileSync(personaPath, 'utf8');
    const parsed = parsePersona(content);
    
    res.json({
      success: true,
      data: {
        id: agentId,
        ...parsed,
        rawContent: content
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent',
      message: error.message
    });
  }
});

/**
 * GET /api/agents/:agentId/tasks
 * Get available tasks for a specific agent
 */
router.get('/:agentId/tasks', (req, res) => {
  try {
    const { agentId } = req.params;
    
    // Get all tasks
    const allTasks = fs.readdirSync(tasksDir)
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const content = fs.readFileSync(path.join(tasksDir, file), 'utf8');
        const title = content.split('\n')[0].replace('# ', '') || file.replace('.md', '');
        
        return {
          id: file.replace('.md', ''),
          name: title,
          file: file,
          description: content.split('\n').slice(1, 3).join(' ').trim()
        };
      });
    
    // Filter tasks based on agent capabilities (simplified for now)
    // In a real implementation, you'd have a more sophisticated mapping
    const agentTaskMap = {
      'role-analyst-a-brainstorming-ba-and-ra-expert': ['core-dump-task', 'create-next-story-task'],
      'role-product-manager-(pm)-agent': ['prd-generate-task', 'checklist-validation-task'],
      'role-architect-agent': ['architecture-creation-task', 'doc-sharding-task'],
      'role-design-architect-uiux-&-frontend-strategy-expert': ['create-frontend-architecture-task', 'create-uiux-specification-task', 'create-ai-frontend-prompt-task'],
      'role-technical-product-owner-(po)-agent': ['checklist-validation-task', 'correct-course-task'],
      'role-scrum-master-agent': ['create-next-story-task', 'correct-course-task']
    };
    
    const agentTasks = agentTaskMap[agentId] || [];
    const filteredTasks = allTasks.filter(task => agentTasks.includes(task.id));
    
    res.json({
      success: true,
      data: filteredTasks,
      agentId,
      count: filteredTasks.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent tasks',
      message: error.message
    });
  }
});

/**
 * GET /api/agents/config
 * Get agent configuration
 */
router.get('/config', (req, res) => {
  try {
    const configPath = path.join(configDir, 'agent-config.md');
    const content = fs.readFileSync(configPath, 'utf8');
    
    res.json({
      success: true,
      data: {
        content,
        lastModified: fs.statSync(configPath).mtime
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent configuration',
      message: error.message
    });
  }
});

/**
 * GET /api/agents/workflow/:phase
 * Get recommended workflow for a specific phase
 */
router.get('/workflow/:phase', (req, res) => {
  try {
    const { phase } = req.params;
    
    // Define BMAD workflow phases
    const workflows = {
      'analyst': {
        phase: 'Analysis & Research',
        agent: 'role-analyst-a-brainstorming-ba-and-ra-expert',
        tasks: ['core-dump-task'],
        templates: ['project-brief-project-name.md'],
        checklists: [],
        nextPhase: 'pm'
      },
      'pm': {
        phase: 'Product Management',
        agent: 'role-product-manager-(pm)-agent',
        tasks: ['prd-generate-task'],
        templates: ['project-name-product-requirements-document-(prd).md'],
        checklists: ['product-manager-(pm)-requirements-checklist.md'],
        nextPhase: 'architect'
      },
      'architect': {
        phase: 'System Architecture',
        agent: 'role-architect-agent',
        tasks: ['architecture-creation-task'],
        templates: ['project-name-architecture-document.md'],
        checklists: ['architect-solution-validation-checklist.md'],
        nextPhase: 'design-architect'
      },
      'design-architect': {
        phase: 'Frontend Architecture & Design',
        agent: 'role-design-architect-uiux-&-frontend-strategy-expert',
        tasks: ['create-frontend-architecture-task', 'create-uiux-specification-task'],
        templates: ['project-name-frontend-architecture-document.md', 'project-name-uiux-specification.md'],
        checklists: ['frontend-architecture-document-review-checklist.md'],
        nextPhase: 'po'
      },
      'po': {
        phase: 'Product Owner Validation',
        agent: 'role-technical-product-owner-(po)-agent',
        tasks: ['checklist-validation-task'],
        templates: [],
        checklists: ['product-owner-(po)-validation-checklist.md'],
        nextPhase: 'sm'
      },
      'sm': {
        phase: 'Story Management',
        agent: 'role-scrum-master-agent',
        tasks: ['create-next-story-task'],
        templates: ['story-epicnum.storynum-short-title-copied-from-epic-file.md'],
        checklists: ['story-definition-of-done-(dod)-checklist.md', 'story-draft-checklist.md'],
        nextPhase: null
      }
    };
    
    const workflow = workflows[phase.toLowerCase()];
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow phase not found'
      });
    }
    
    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workflow',
      message: error.message
    });
  }
});

module.exports = router;
