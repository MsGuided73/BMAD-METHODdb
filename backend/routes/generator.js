const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const TemplateParser = require('../utils/templateParser');

const templateParser = new TemplateParser();
const sessionsDir = path.join(__dirname, '../data/sessions');
const outputDir = path.join(__dirname, '../output');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * Generate agent prompt for a specific phase
 */
function generateAgentPrompt(phase, sessionData) {
  const agentPrompts = {
    analyst: `# Analyst Agent Prompt

You are an expert business analyst and researcher. Your task is to help implement the project based on the following brief:

## Project Overview
**Project Name:** ${sessionData.projectName}

## Project Brief
${sessionData.phases.analyst.outputs.find(o => o.type === 'project-brief')?.content || 'No project brief available'}

## Your Role
- Conduct additional research as needed
- Clarify requirements and assumptions
- Identify potential risks and opportunities
- Provide detailed analysis and recommendations

## Instructions
Use this information to guide your analysis and provide detailed insights for the development team.`,

    pm: `# Product Manager Agent Prompt

You are an expert product manager. Use the following PRD to guide product development:

## Project Overview
**Project Name:** ${sessionData.projectName}

## Product Requirements Document
${sessionData.phases.pm.outputs.find(o => o.type === 'prd')?.content || 'No PRD available'}

## Your Role
- Ensure product requirements are met
- Prioritize features and functionality
- Make product decisions based on the PRD
- Coordinate with development team

## Instructions
Reference this PRD for all product-related decisions and implementations.`,

    architect: `# System Architect Agent Prompt

You are a senior system architect. Use the following architecture document to guide system design:

## Project Overview
**Project Name:** ${sessionData.projectName}

## System Architecture
${sessionData.phases.architect.outputs.find(o => o.type === 'architecture')?.content || 'No architecture document available'}

## Your Role
- Implement the defined system architecture
- Ensure scalability and performance requirements are met
- Make technical decisions aligned with the architecture
- Guide development team on technical implementation

## Instructions
Follow this architecture document for all system design and implementation decisions.`,

    developer: `# Developer Agent Prompt

You are a senior full-stack developer. Use the following comprehensive project documentation to guide development:

## Project Overview
**Project Name:** ${sessionData.projectName}

## Complete Project Documentation

### Project Brief
${sessionData.phases.analyst.outputs.find(o => o.type === 'project-brief')?.content || 'No project brief available'}

### Product Requirements Document
${sessionData.phases.pm.outputs.find(o => o.type === 'prd')?.content || 'No PRD available'}

### System Architecture
${sessionData.phases.architect.outputs.find(o => o.type === 'architecture')?.content || 'No architecture document available'}

### Frontend Architecture & UI/UX Specifications
${sessionData.phases.designArchitect.outputs.find(o => o.type === 'frontend-architecture')?.content || 'No frontend architecture available'}

${sessionData.phases.designArchitect.outputs.find(o => o.type === 'uiux-spec')?.content || 'No UI/UX specifications available'}

### User Stories
${sessionData.phases.sm.outputs.filter(o => o.type === 'story').map(story => story.content).join('\n\n---\n\n') || 'No user stories available'}

## Your Role
- Implement all features according to specifications
- Follow the defined architecture and design patterns
- Ensure code quality and best practices
- Test implementations thoroughly

## Instructions
Use this comprehensive documentation to build the complete application. Prioritize user stories and follow the technical specifications exactly.`
  };

  return agentPrompts[phase] || `# ${phase.charAt(0).toUpperCase() + phase.slice(1)} Agent Prompt\n\nProject: ${sessionData.projectName}\n\nUse the project documentation to guide your work.`;
}

/**
 * POST /api/generator/package/:sessionId
 * Generate complete project package
 */
router.post('/package/:sessionId', async (req, res) => {
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
    const projectName = session.projectName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const packageDir = path.join(outputDir, `${projectName}-${sessionId}`);
    
    // Create package directory structure
    const dirs = [
      'docs',
      'stories',
      'agent-prompts',
      'checklists',
      'templates'
    ];
    
    dirs.forEach(dir => {
      const dirPath = path.join(packageDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
    
    // Generate documents from each phase
    const generatedFiles = [];
    
    // Phase outputs
    Object.entries(session.phases).forEach(([phaseName, phaseData]) => {
      if (phaseData.completed && phaseData.outputs) {
        phaseData.outputs.forEach(output => {
          const filename = `${output.type}.md`;
          const filePath = path.join(packageDir, 'docs', filename);
          fs.writeFileSync(filePath, output.content);
          generatedFiles.push(`docs/${filename}`);
        });
      }
    });
    
    // Generate agent prompts
    const agentPhases = ['analyst', 'pm', 'architect', 'developer'];
    agentPhases.forEach(phase => {
      const prompt = generateAgentPrompt(phase, session);
      const filename = `${phase}-agent-prompt.md`;
      const filePath = path.join(packageDir, 'agent-prompts', filename);
      fs.writeFileSync(filePath, prompt);
      generatedFiles.push(`agent-prompts/${filename}`);
    });
    
    // Copy completed checklists
    Object.entries(session.phases).forEach(([phaseName, phaseData]) => {
      if (phaseData.completed && phaseData.checklistResults) {
        Object.entries(phaseData.checklistResults).forEach(([checklistName, results]) => {
          const content = `# ${checklistName} - Completed\n\n**Completion:** ${results.completionPercentage}%\n**Completed At:** ${results.timestamp}\n\n## Results\n${JSON.stringify(results.responses, null, 2)}`;
          const filename = `completed-${checklistName}`;
          const filePath = path.join(packageDir, 'checklists', filename);
          fs.writeFileSync(filePath, content);
          generatedFiles.push(`checklists/${filename}`);
        });
      }
    });
    
    // Generate project README
    const readme = `# ${session.projectName}

Generated using the BMAD Method Planning Application

## Project Overview
This package contains all the planning documents and agent prompts needed to implement your project using AI-driven development.

## Contents

### 📋 Documentation (/docs)
- Project brief and requirements
- System architecture documents
- Frontend architecture and UI/UX specifications
- User stories and epics

### 🤖 Agent Prompts (/agent-prompts)
- Ready-to-use prompts for different AI agents
- Analyst, PM, Architect, and Developer prompts
- Copy and paste into your preferred AI coding tool

### ✅ Checklists (/checklists)
- Completed validation checklists
- Quality assurance records

## How to Use

1. **Start with the Developer Agent Prompt**: Use \`agent-prompts/developer-agent-prompt.md\` as your main prompt for AI coding tools
2. **Reference Documentation**: All project docs are in the \`docs/\` folder
3. **Follow User Stories**: Implement features based on the user stories provided
4. **Use Specialized Prompts**: Switch to specific agent prompts for specialized tasks

## Generated On
${new Date().toISOString()}

## Session ID
${sessionId}
`;
    
    const readmePath = path.join(packageDir, 'README.md');
    fs.writeFileSync(readmePath, readme);
    generatedFiles.push('README.md');
    
    // Create ZIP archive
    const zipPath = path.join(outputDir, `${projectName}-${sessionId}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => {
      // Clean up temporary directory
      fs.rmSync(packageDir, { recursive: true, force: true });
      
      res.json({
        success: true,
        data: {
          sessionId,
          projectName: session.projectName,
          packagePath: `/api/generator/download/${path.basename(zipPath)}`,
          files: generatedFiles,
          size: archive.pointer()
        }
      });
    });
    
    archive.on('error', (err) => {
      throw err;
    });
    
    archive.pipe(output);
    archive.directory(packageDir, false);
    archive.finalize();
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate package',
      message: error.message
    });
  }
});

/**
 * GET /api/generator/download/:filename
 * Download generated package
 */
router.get('/download/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(outputDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
    
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
      } else {
        // Clean up file after download
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }, 60000); // Delete after 1 minute
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to download file',
      message: error.message
    });
  }
});

/**
 * POST /api/generator/preview/:sessionId
 * Generate preview of what will be included in package
 */
router.post('/preview/:sessionId', (req, res) => {
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
    
    // Generate preview of what will be included
    const preview = {
      projectName: session.projectName,
      sessionId,
      phases: {},
      estimatedFiles: 0
    };
    
    Object.entries(session.phases).forEach(([phaseName, phaseData]) => {
      preview.phases[phaseName] = {
        completed: phaseData.completed,
        outputs: phaseData.outputs ? phaseData.outputs.length : 0,
        outputTypes: phaseData.outputs ? phaseData.outputs.map(o => o.type) : []
      };
      
      if (phaseData.completed && phaseData.outputs) {
        preview.estimatedFiles += phaseData.outputs.length;
      }
    });
    
    // Add agent prompts and README
    preview.estimatedFiles += 5; // 4 agent prompts + README
    
    res.json({
      success: true,
      data: preview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate preview',
      message: error.message
    });
  }
});

module.exports = router;
