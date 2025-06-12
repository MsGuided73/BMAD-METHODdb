const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const FileManager = require('./fileManager');

/**
 * AI Orchestrator Service
 * Manages interactions with Gemini 2.5 Pro for BMAD Method agents
 */
class AIOrchestrator {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.initialized = false;
    this.personasDir = path.join(__dirname, '../data/personas');
    this.tasksDir = path.join(__dirname, '../data/tasks');
    this.templatesDir = path.join(__dirname, '../data/templates');
    this.fileManager = new FileManager();
  }

  /**
   * Initialize the AI service with API key
   */
  async initialize(apiKey) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      this.initialized = true;
      console.log('✅ AI Orchestrator initialized with Gemini 2.5 Pro');
    } catch (error) {
      console.error('❌ Failed to initialize AI Orchestrator:', error);
      throw error;
    }
  }

  /**
   * Check if the service is ready
   */
  isReady() {
    return this.initialized && this.model;
  }

  /**
   * Load persona content for an agent
   */
  loadPersona(agentId) {
    const personaPath = path.join(this.personasDir, `${agentId}.md`);
    if (!fs.existsSync(personaPath)) {
      throw new Error(`Persona not found: ${agentId}`);
    }
    return fs.readFileSync(personaPath, 'utf8');
  }

  /**
   * Load task content
   */
  loadTask(taskId) {
    const taskPath = path.join(this.tasksDir, `${taskId}.md`);
    if (!fs.existsSync(taskPath)) {
      throw new Error(`Task not found: ${taskId}`);
    }
    return fs.readFileSync(taskPath, 'utf8');
  }

  /**
   * Load template content
   */
  loadTemplate(templateName) {
    // Map short template names to actual filenames
    const templateMap = {
      'project-brief': 'project-brief-project-name.md',
      'prd': 'project-name-product-requirements-document-(prd).md',
      'architecture': 'project-name-architecture-document.md',
      'frontend-architecture': 'project-name-frontend-architecture-document.md',
      'uiux-specification': 'project-name-uiux-specification.md',
      'story': 'story-epicnum.storynum-short-title-copied-from-epic-file.md'
    };

    // Use mapped filename if available, otherwise use the provided name
    const actualTemplateName = templateMap[templateName] || templateName;

    // Try the mapped name first, then try adding .md extension if needed
    let templatePath = path.join(this.templatesDir, actualTemplateName);

    if (!fs.existsSync(templatePath) && !actualTemplateName.endsWith('.md')) {
      templatePath = path.join(this.templatesDir, actualTemplateName + '.md');
    }

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templateName} (looked for: ${actualTemplateName})`);
    }

    return fs.readFileSync(templatePath, 'utf8');
  }

  /**
   * Create a comprehensive prompt for the AI agent
   */
  buildAgentPrompt(agentId, phase, context = {}) {
    const persona = this.loadPersona(agentId);
    const { projectName, projectBrief, userInput, previousPhases, chatHistory, sessionId } = context;

    let prompt = `# BMAD Method AI Agent Session

## Your Role
${persona}

## Current Phase: ${phase.toUpperCase()}

## Project Context
**Project Name:** ${projectName || 'Not specified'}

**Project Brief:**
${projectBrief || 'No project brief available yet'}

## Previous Phase Outputs
${previousPhases ? JSON.stringify(previousPhases, null, 2) : 'No previous phases completed'}`;

    // Add full document context from generated files
    if (sessionId) {
      const sessionContext = this.fileManager.getSessionContext(sessionId);
      if (Object.keys(sessionContext).length > 0) {
        prompt += `

## Generated Documents (Full Content)
`;
        Object.entries(sessionContext).forEach(([filename, content]) => {
          prompt += `
### ${filename.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
${content}

---
`;
        });
      }
    }

    // Add chat history if available
    if (chatHistory && chatHistory.length > 0) {
      prompt += `

## Chat History
`;
      chatHistory.forEach(message => {
        if (message.type === 'user') {
          prompt += `**User:** ${message.content}\n`;
        } else if (message.type === 'ai') {
          prompt += `**You:** ${message.content}\n`;
        }
      });
    }

    prompt += `

## Current User Message
${userInput || 'User is starting this phase'}

## Instructions
1. Act as the specified agent persona consistently
2. Remember the conversation history and maintain context
3. The project name is "${projectName}" - always use this exact name
4. Help the user complete the current BMAD phase
5. Ask clarifying questions to gather necessary information
6. Provide expert guidance based on your role
7. Generate structured outputs that can be used in templates
8. Be conversational but professional
9. Focus on the specific phase requirements
10. When the user is ready, offer to generate templates for this phase

## Response Format
Please respond in a conversational manner, maintaining context from our previous conversation. If you need specific information to proceed, ask for it clearly. Always use the correct project name "${projectName}".`;

    return prompt;
  }

  /**
   * Chat with an AI agent
   */
  async chatWithAgent(agentId, phase, userMessage, context = {}) {
    if (!this.isReady()) {
      throw new Error('AI Orchestrator not initialized');
    }

    try {
      const prompt = this.buildAgentPrompt(agentId, phase, {
        ...context,
        userInput: userMessage
      });

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        response: text,
        agentId,
        phase,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in AI chat:', error);
      throw new Error(`AI chat failed: ${error.message}`);
    }
  }

  /**
   * Generate content for a specific template using AI
   */
  async generateTemplateContent(templateName, agentId, context = {}) {
    if (!this.isReady()) {
      throw new Error('AI Orchestrator not initialized');
    }

    try {
      const template = this.loadTemplate(templateName);
      const persona = this.loadPersona(agentId);

      // Build enhanced prompt with full document context
      const enhancedContext = { ...context, sessionId: context.sessionId };
      const prompt = this.buildTemplatePrompt(persona, template, enhancedContext);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Save the generated content immediately as .md file
      let savedFile = null;
      if (context.sessionId && context.projectName) {
        const filename = this.generateFilename(templateName, context.projectName);
        savedFile = this.fileManager.saveGeneratedFile(
          context.sessionId,
          filename,
          text,
          {
            phase: context.phase,
            agentId,
            templateName,
            projectName: context.projectName
          }
        );
      }

      return {
        success: true,
        content: text,
        templateName,
        agentId,
        timestamp: new Date().toISOString(),
        savedFile
      };
    } catch (error) {
      console.error('Error generating template content:', error);
      throw new Error(`Template generation failed: ${error.message}`);
    }
  }

  /**
   * Build enhanced template prompt with full document context
   */
  buildTemplatePrompt(persona, template, context) {
    let prompt = `# Template Generation Task

## Your Role
${persona}

## Template to Fill
${template}

## Project Context
${JSON.stringify(context, null, 2)}`;

    // Add full document context from generated files
    if (context.sessionId) {
      const sessionContext = this.fileManager.getSessionContext(context.sessionId);
      if (Object.keys(sessionContext).length > 0) {
        prompt += `

## Previously Generated Documents (Full Content)
`;
        Object.entries(sessionContext).forEach(([filename, content]) => {
          prompt += `
### ${filename.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
${content}

---
`;
        });
      }
    }

    prompt += `

## Instructions
1. Fill out the template completely based on the project context and previously generated documents
2. Use your expertise as the specified agent
3. Replace all placeholders with appropriate content
4. Ensure consistency with previously generated documents
5. Ensure the output is professional and comprehensive
6. Return only the filled template content, no additional commentary

Generate the completed template:`;

    return prompt;
  }

  /**
   * Generate appropriate filename for template
   */
  generateFilename(templateName, projectName) {
    const projectSlug = projectName.toLowerCase().replace(/\s+/g, '-');

    // Map template names to appropriate filenames
    const templateMap = {
      'project-name-project-brief.md': `${projectSlug}-project-brief.md`,
      'project-name-prd.md': `${projectSlug}-prd.md`,
      'project-name-architecture-document.md': `${projectSlug}-architecture.md`,
      'project-name-frontend-architecture-document.md': `${projectSlug}-frontend-architecture.md`,
      'project-name-uiux-specification.md': `${projectSlug}-uiux-spec.md`,
      'project-name-po-validation.md': `${projectSlug}-po-validation.md`,
      'project-name-user-stories.md': `${projectSlug}-user-stories.md`
    };

    return templateMap[templateName] || `${projectSlug}-${templateName}`;
  }

  /**
   * Get agent suggestions for next steps
   */
  async getAgentSuggestions(agentId, phase, currentData = {}) {
    if (!this.isReady()) {
      throw new Error('AI Orchestrator not initialized');
    }

    try {
      const persona = this.loadPersona(agentId);

      const prompt = `# Agent Suggestions Request

## Your Role
${persona}

## Current Phase: ${phase}

## Current Data
${JSON.stringify(currentData, null, 2)}

## Instructions
Provide 3-5 specific, actionable suggestions for what the user should do next in this phase. Be concise and practical.

Format your response as a JSON array of suggestion objects:
[
  {
    "title": "Suggestion title",
    "description": "Brief description",
    "priority": "high|medium|low"
  }
]`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Try to parse JSON response
      try {
        const suggestions = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
        return {
          success: true,
          suggestions,
          agentId,
          phase
        };
      } catch (parseError) {
        // Fallback to text response
        return {
          success: true,
          suggestions: [{ title: 'AI Guidance', description: text, priority: 'medium' }],
          agentId,
          phase
        };
      }
    } catch (error) {
      console.error('Error getting agent suggestions:', error);
      throw new Error(`Suggestions failed: ${error.message}`);
    }
  }
}

module.exports = AIOrchestrator;
