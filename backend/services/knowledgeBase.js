const fs = require('fs');
const path = require('path');
const axios = require('axios');

class KnowledgeBaseService {
  constructor() {
    this.knowledgeBaseDir = path.join(__dirname, '../data/knowledge-base');
    this.elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    this.elevenLabsAgentId = process.env.ELEVENLABS_AGENT_ID || 'XOdViW6mVsNnpckOV5d6';
    
    // Ensure knowledge base directory exists
    this.ensureDirectoryExists();
  }

  ensureDirectoryExists() {
    if (!fs.existsSync(this.knowledgeBaseDir)) {
      fs.mkdirSync(this.knowledgeBaseDir, { recursive: true });
    }

    // Create subdirectories for organization
    const subdirs = ['projects', 'templates', 'sessions', 'generated-docs', 'metadata'];
    subdirs.forEach(subdir => {
      const dirPath = path.join(this.knowledgeBaseDir, subdir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  }

  /**
   * Save a document to the knowledge base
   */
  async saveDocument(documentData) {
    try {
      const {
        sessionId,
        projectName,
        phase,
        documentType,
        content,
        metadata = {}
      } = documentData;

      // Generate unique document ID
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const docId = `${sessionId}-${phase}-${documentType}-${timestamp}`;

      // Create document record
      const document = {
        id: docId,
        sessionId,
        projectName: projectName || 'Unknown Project',
        phase,
        documentType,
        content,
        metadata: {
          ...metadata,
          createdAt: new Date().toISOString(),
          wordCount: content.split(/\s+/).length,
          characterCount: content.length
        },
        tags: this.generateTags(documentType, phase, content),
        summary: this.generateSummary(content)
      };

      // Save to local knowledge base
      await this.saveToLocalKnowledgeBase(document);

      // Update ElevenLabs agent knowledge base
      if (this.elevenLabsApiKey) {
        await this.updateElevenLabsKnowledgeBase(document);
      }

      // Update project index
      await this.updateProjectIndex(sessionId, projectName, document);

      console.log(`✅ Document saved to knowledge base: ${docId}`);
      return { success: true, documentId: docId };

    } catch (error) {
      console.error('❌ Failed to save document to knowledge base:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save document to local file system
   */
  async saveToLocalKnowledgeBase(document) {
    const filePath = path.join(
      this.knowledgeBaseDir,
      'generated-docs',
      `${document.id}.json`
    );

    fs.writeFileSync(filePath, JSON.stringify(document, null, 2));

    // Also save content as markdown for easy reading
    const mdPath = path.join(
      this.knowledgeBaseDir,
      'generated-docs',
      `${document.id}.md`
    );

    const markdownContent = `# ${document.projectName} - ${document.documentType}

**Phase:** ${document.phase}
**Created:** ${document.metadata.createdAt}
**Session:** ${document.sessionId}

---

${document.content}

---

**Metadata:**
- Word Count: ${document.metadata.wordCount}
- Character Count: ${document.metadata.characterCount}
- Tags: ${document.tags.join(', ')}
- Summary: ${document.summary}
`;

    fs.writeFileSync(mdPath, markdownContent);
  }

  /**
   * Update ElevenLabs agent knowledge base
   */
  async updateElevenLabsKnowledgeBase(document) {
    if (!this.elevenLabsApiKey) {
      console.warn('⚠️ ElevenLabs API key not configured, skipping voice agent update');
      return;
    }

    try {
      // Prepare document for ElevenLabs
      const knowledgeEntry = {
        title: `${document.projectName} - ${document.documentType}`,
        content: `Project: ${document.projectName}
Phase: ${document.phase}
Document Type: ${document.documentType}
Created: ${document.metadata.createdAt}

Summary: ${document.summary}

Content:
${document.content}

Tags: ${document.tags.join(', ')}`,
        metadata: {
          sessionId: document.sessionId,
          phase: document.phase,
          documentType: document.documentType,
          projectName: document.projectName
        }
      };

      // Update ElevenLabs knowledge base via API
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/convai/agents/${this.elevenLabsAgentId}/knowledge-base`,
        knowledgeEntry,
        {
          headers: {
            'Authorization': `Bearer ${this.elevenLabsApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Updated ElevenLabs knowledge base for document: ${document.id}`);
      return response.data;

    } catch (error) {
      console.error('❌ Failed to update ElevenLabs knowledge base:', error.response?.data || error.message);
      // Don't throw error - continue even if ElevenLabs update fails
    }
  }

  /**
   * Update project index for better organization
   */
  async updateProjectIndex(sessionId, projectName, document) {
    const indexPath = path.join(this.knowledgeBaseDir, 'projects', `${sessionId}.json`);
    
    let projectIndex = {};
    if (fs.existsSync(indexPath)) {
      projectIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    }

    if (!projectIndex.documents) {
      projectIndex.documents = [];
    }

    projectIndex.sessionId = sessionId;
    projectIndex.projectName = projectName;
    projectIndex.lastUpdated = new Date().toISOString();
    projectIndex.documents.push({
      id: document.id,
      phase: document.phase,
      documentType: document.documentType,
      createdAt: document.metadata.createdAt,
      summary: document.summary
    });

    fs.writeFileSync(indexPath, JSON.stringify(projectIndex, null, 2));
  }

  /**
   * Generate tags for better categorization
   */
  generateTags(documentType, phase, content) {
    const tags = [phase, documentType];
    
    // Add content-based tags
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('api')) tags.push('api');
    if (contentLower.includes('database')) tags.push('database');
    if (contentLower.includes('frontend')) tags.push('frontend');
    if (contentLower.includes('backend')) tags.push('backend');
    if (contentLower.includes('security')) tags.push('security');
    if (contentLower.includes('performance')) tags.push('performance');
    if (contentLower.includes('testing')) tags.push('testing');
    if (contentLower.includes('deployment')) tags.push('deployment');
    if (contentLower.includes('architecture')) tags.push('architecture');
    if (contentLower.includes('requirements')) tags.push('requirements');
    if (contentLower.includes('user story')) tags.push('user-stories');
    if (contentLower.includes('ui') || contentLower.includes('ux')) tags.push('ui-ux');

    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Generate a summary of the document content
   */
  generateSummary(content) {
    // Simple extractive summary - take first few sentences
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const summary = sentences.slice(0, 3).join('. ').trim();
    return summary.length > 200 ? summary.substring(0, 200) + '...' : summary;
  }

  /**
   * Get all documents for a project
   */
  async getProjectDocuments(sessionId) {
    try {
      const indexPath = path.join(this.knowledgeBaseDir, 'projects', `${sessionId}.json`);
      
      if (!fs.existsSync(indexPath)) {
        return { success: true, documents: [] };
      }

      const projectIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      return { success: true, documents: projectIndex.documents || [] };

    } catch (error) {
      console.error('Failed to get project documents:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Search documents in knowledge base
   */
  async searchDocuments(query, filters = {}) {
    try {
      const docsDir = path.join(this.knowledgeBaseDir, 'generated-docs');
      const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.json'));
      
      const documents = files.map(file => {
        const content = fs.readFileSync(path.join(docsDir, file), 'utf8');
        return JSON.parse(content);
      });

      // Simple text search
      const results = documents.filter(doc => {
        const searchText = `${doc.projectName} ${doc.content} ${doc.tags.join(' ')}`.toLowerCase();
        const matchesQuery = !query || searchText.includes(query.toLowerCase());
        
        const matchesFilters = Object.entries(filters).every(([key, value]) => {
          return !value || doc[key] === value;
        });

        return matchesQuery && matchesFilters;
      });

      return { success: true, results };

    } catch (error) {
      console.error('Failed to search documents:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = KnowledgeBaseService;
