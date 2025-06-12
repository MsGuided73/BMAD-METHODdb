const express = require('express');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const AirtableService = require('../services/airtableService');
const { Session } = require('../models');

const router = express.Router();
const airtableService = new AirtableService();

/**
 * GET /api/projects
 * Get all projects for the authenticated user
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Get projects from both local database and Airtable
    const [localSessions, airtableResult] = await Promise.all([
      Session.findAll({
        where: { user_id: userId },
        order: [['updated_at', 'DESC']],
        limit: 50
      }),
      airtableService.getUserProjects(userId, userEmail)
    ]);

    // Convert local sessions to project format
    const localProjects = localSessions.map(session => ({
      id: session.id,
      projectName: session.project_name || 'Untitled Project',
      description: session.description || '',
      currentPhase: session.current_phase || 'analyst',
      status: session.status || 'active',
      progress: calculateLocalProgress(session.phases),
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      completedAt: session.completed_at,
      tags: session.tags ? session.tags.split(',') : [],
      isPublic: session.is_public || false,
      source: 'local',
      phases: session.phases || {},
      generatedFiles: session.generated_files || []
    }));

    // Combine local and Airtable projects
    let allProjects = [...localProjects];
    
    if (airtableResult.success) {
      // Add Airtable projects that aren't already in local database
      const localProjectIds = new Set(localProjects.map(p => p.id));
      const airtableProjects = airtableResult.projects
        .filter(p => !localProjectIds.has(p.id))
        .map(p => ({ ...p, source: 'airtable' }));
      
      allProjects = [...allProjects, ...airtableProjects];
    }

    // Sort by updated date
    allProjects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.json({
      success: true,
      projects: allProjects,
      stats: {
        total: allProjects.length,
        active: allProjects.filter(p => p.status === 'active').length,
        completed: allProjects.filter(p => p.status === 'completed').length,
        local: localProjects.length,
        airtable: airtableResult.success ? airtableResult.projects.length : 0
      }
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve projects'
    });
  }
});

/**
 * GET /api/projects/:id
 * Get a specific project by ID
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Try to get from local database first
    let project = await Session.findOne({
      where: { id },
      ...(userId && { where: { id, user_id: userId } })
    });

    if (project) {
      // Convert to project format
      project = {
        id: project.id,
        projectName: project.project_name || 'Untitled Project',
        description: project.description || '',
        currentPhase: project.current_phase || 'analyst',
        status: project.status || 'active',
        progress: calculateLocalProgress(project.phases),
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        completedAt: project.completed_at,
        tags: project.tags ? project.tags.split(',') : [],
        isPublic: project.is_public || false,
        source: 'local',
        phases: project.phases || {},
        generatedFiles: project.generated_files || []
      };
    } else {
      // Try Airtable if not found locally
      const airtableProject = await airtableService.getProjectById(id);
      if (airtableProject) {
        project = { ...airtableProject, source: 'airtable' };
      }
    }

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.json({
      success: true,
      project
    });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve project'
    });
  }
});

/**
 * POST /api/projects
 * Create a new project
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      projectName,
      description,
      tags,
      isPublic = false
    } = req.body;

    if (!projectName) {
      return res.status(400).json({
        success: false,
        error: 'Project name is required'
      });
    }

    const userId = req.user.id;
    const userEmail = req.user.email;

    // Create in local database
    const session = await Session.create({
      user_id: userId,
      project_name: projectName,
      description: description || '',
      current_phase: 'analyst',
      status: 'active',
      is_public: isPublic,
      tags: tags ? tags.join(',') : '',
      phases: {},
      generated_files: []
    });

    // Also save to Airtable if configured
    const projectData = {
      id: session.id,
      projectName,
      description,
      currentPhase: 'analyst',
      status: 'active',
      userId,
      userEmail,
      createdAt: session.created_at,
      tags,
      isPublic,
      phases: {},
      generatedFiles: []
    };

    const airtableResult = await airtableService.saveProject(projectData);
    
    res.status(201).json({
      success: true,
      project: {
        id: session.id,
        projectName: session.project_name,
        description: session.description,
        currentPhase: session.current_phase,
        status: session.status,
        progress: 0,
        createdAt: session.created_at,
        updatedAt: session.updated_at,
        tags: tags || [],
        isPublic: session.is_public,
        source: 'local',
        phases: {},
        generatedFiles: []
      },
      airtableSync: airtableResult.success
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create project'
    });
  }
});

/**
 * PUT /api/projects/:id
 * Update a project
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    // Update in local database
    const [updatedCount] = await Session.update(
      {
        project_name: updates.projectName,
        description: updates.description,
        current_phase: updates.currentPhase,
        status: updates.status,
        tags: updates.tags ? updates.tags.join(',') : '',
        is_public: updates.isPublic,
        phases: updates.phases,
        generated_files: updates.generatedFiles,
        completed_at: updates.status === 'completed' ? new Date() : null
      },
      {
        where: { id, user_id: userId }
      }
    );

    if (updatedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }

    // Also update in Airtable
    const projectData = {
      id,
      ...updates,
      userId,
      userEmail: req.user.email
    };

    const airtableResult = await airtableService.saveProject(projectData);

    res.json({
      success: true,
      message: 'Project updated successfully',
      airtableSync: airtableResult.success
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update project'
    });
  }
});

/**
 * DELETE /api/projects/:id
 * Delete a project
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Delete from local database
    const deletedCount = await Session.destroy({
      where: { id, user_id: userId }
    });

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }

    // Also delete from Airtable
    const airtableResult = await airtableService.deleteProject(id);

    res.json({
      success: true,
      message: 'Project deleted successfully',
      airtableSync: airtableResult.success
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete project'
    });
  }
});

/**
 * GET /api/projects/:id/documents
 * Get all documents for a project
 */
router.get('/:id/documents', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Get documents from Airtable
    const result = await airtableService.getProjectDocuments(id);

    if (result.success) {
      res.json({
        success: true,
        documents: result.documents,
        count: result.documents.length
      });
    } else {
      res.json({
        success: true,
        documents: [],
        count: 0,
        message: 'No documents found or Airtable not configured'
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
 * GET /api/projects/search
 * Search projects
 */
router.get('/search', requireAuth, async (req, res) => {
  try {
    const { q: query, status, phase } = req.query;
    const userId = req.user.id;

    const filters = {};
    if (status) filters.status = status;
    if (phase) filters.phase = phase;

    const result = await airtableService.searchProjects(userId, query, filters);

    if (result.success) {
      res.json({
        success: true,
        projects: result.projects,
        query,
        filters,
        count: result.projects.length
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('Search projects error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search projects'
    });
  }
});

/**
 * Helper function to calculate progress from local session phases
 */
function calculateLocalProgress(phases) {
  if (!phases) return 0;
  
  const phaseNames = ['analyst', 'pm', 'architect', 'designArchitect', 'po', 'sm'];
  const completedPhases = phaseNames.filter(phase => phases[phase]?.completed).length;
  
  return Math.round((completedPhases / phaseNames.length) * 100);
}

module.exports = router;
