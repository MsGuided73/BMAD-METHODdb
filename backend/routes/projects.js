const express = require('express');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const AirtableService = require('../services/airtableService');
const { Session } = require('../models');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

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

    // Calculate comprehensive stats
    const stats = calculateProjectStats(allProjects);

    res.json({
      success: true,
      projects: allProjects,
      stats
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
 * GET /api/projects/:id/export
 * Export all project documents as a ZIP file
 */
router.get('/:id/export', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get project details
    const project = await Session.findOne({
      where: { id, user_id: userId }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Set response headers
    const projectName = project.project_name || 'project';
    const sanitizedName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filename = `${sanitizedName}-export-${new Date().toISOString().slice(0, 10)}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Pipe archive to response
    archive.pipe(res);

    // Add project metadata
    const projectMetadata = {
      projectName: project.project_name,
      description: project.description,
      currentPhase: project.current_phase,
      status: project.status,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      tags: project.tags ? project.tags.split(',') : [],
      isPublic: project.is_public,
      phases: project.phases || {},
      generatedFiles: project.generated_files || [],
      exportedAt: new Date().toISOString(),
      exportedBy: req.user.email
    };

    archive.append(JSON.stringify(projectMetadata, null, 2), { name: 'project-metadata.json' });

    // Add generated files from session directory
    const sessionDir = path.join(__dirname, '../generated-docs', id);
    if (fs.existsSync(sessionDir)) {
      const files = fs.readdirSync(sessionDir);

      for (const file of files) {
        const filePath = path.join(sessionDir, file);
        if (fs.statSync(filePath).isFile()) {
          const content = fs.readFileSync(filePath, 'utf8');
          archive.append(content, { name: `documents/${file}` });
        }
      }
    }

    // Add README with instructions
    const readmeContent = `# ${project.project_name} - BMAD Method Export

This export contains all documents and metadata for your BMAD Method project.

## Contents

- **project-metadata.json**: Project configuration and metadata
- **documents/**: All generated documents from the BMAD workflow

## Project Information

- **Name**: ${project.project_name}
- **Description**: ${project.description || 'No description provided'}
- **Current Phase**: ${project.current_phase}
- **Status**: ${project.status}
- **Created**: ${new Date(project.created_at).toLocaleDateString()}
- **Last Updated**: ${new Date(project.updated_at).toLocaleDateString()}

## BMAD Method Phases

The BMAD Method follows these phases:
1. **Business Analyst** - Project brief and requirements gathering
2. **Project Manager** - Product requirements document (PRD)
3. **Solution Architect** - Technical architecture design
4. **Design Architect** - UI/UX specifications and design system
5. **Product Owner** - Validation and acceptance criteria
6. **Scrum Master** - Story creation and sprint planning

## Usage

You can import this project back into the BMAD Method system or use the documents independently for your development process.

Generated on: ${new Date().toLocaleDateString()}
Exported by: ${req.user.email}
`;

    archive.append(readmeContent, { name: 'README.md' });

    // Finalize the archive
    await archive.finalize();

  } catch (error) {
    console.error('Export project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export project'
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

/**
 * Helper function to calculate comprehensive project statistics
 */
function calculateProjectStats(projects) {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    pausedProjects: projects.filter(p => p.status === 'paused').length,
    archivedProjects: projects.filter(p => p.status === 'archived').length,
    projectsThisMonth: projects.filter(p => new Date(p.createdAt) >= thisMonth).length,
    averageProgress: 0,
    totalDocuments: 0,
    phaseDistribution: {
      analyst: 0,
      pm: 0,
      architect: 0,
      designArchitect: 0,
      po: 0,
      sm: 0
    },
    sourceDistribution: {
      local: projects.filter(p => p.source === 'local').length,
      airtable: projects.filter(p => p.source === 'airtable').length
    }
  };

  // Calculate average progress
  if (projects.length > 0) {
    const totalProgress = projects.reduce((sum, project) => sum + (project.progress || 0), 0);
    stats.averageProgress = Math.round(totalProgress / projects.length);
  }

  // Calculate total documents
  stats.totalDocuments = projects.reduce((sum, project) => {
    return sum + (project.generatedFiles ? project.generatedFiles.length : 0);
  }, 0);

  // Calculate phase distribution
  projects.forEach(project => {
    const phase = project.currentPhase;
    if (stats.phaseDistribution.hasOwnProperty(phase)) {
      stats.phaseDistribution[phase]++;
    }
  });

  return stats;
}

module.exports = router;
