const axios = require('axios');

class AirtableService {
  constructor() {
    this.apiKey = process.env.AIRTABLE_API_KEY;
    this.baseId = process.env.AIRTABLE_BASE_ID;
    this.baseUrl = `https://api.airtable.com/v0/${this.baseId}`;
    
    if (!this.apiKey || !this.baseId) {
      console.warn('⚠️ Airtable credentials not configured. Some features may not work.');
    }
  }

  /**
   * Get Airtable API headers
   */
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Create or update a project in Airtable
   */
  async saveProject(projectData) {
    try {
      if (!this.apiKey || !this.baseId) {
        throw new Error('Airtable not configured');
      }

      const record = {
        fields: {
          'Project ID': projectData.id,
          'Project Name': projectData.projectName,
          'Description': projectData.description || '',
          'Current Phase': projectData.currentPhase || 'analyst',
          'Status': projectData.status || 'active',
          'User ID': projectData.userId || '',
          'User Email': projectData.userEmail || '',
          'Created At': projectData.createdAt || new Date().toISOString(),
          'Updated At': new Date().toISOString(),
          'Progress': this.calculateProgress(projectData.phases),
          'Phases Data': JSON.stringify(projectData.phases || {}),
          'Generated Files': JSON.stringify(projectData.generatedFiles || []),
          'Tags': projectData.tags ? projectData.tags.join(', ') : '',
          'Is Public': projectData.isPublic || false,
          'Share Token': projectData.shareToken || '',
          'Completed At': projectData.completedAt || null
        }
      };

      // Check if project already exists
      const existingProject = await this.getProjectById(projectData.id);
      
      if (existingProject) {
        // Update existing project
        const response = await axios.patch(
          `${this.baseUrl}/Projects/${existingProject.airtableId}`,
          { fields: record.fields },
          { headers: this.getHeaders() }
        );
        return { success: true, data: response.data, action: 'updated' };
      } else {
        // Create new project
        const response = await axios.post(
          `${this.baseUrl}/Projects`,
          record,
          { headers: this.getHeaders() }
        );
        return { success: true, data: response.data, action: 'created' };
      }

    } catch (error) {
      console.error('Airtable save project error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get project by ID from Airtable
   */
  async getProjectById(projectId) {
    try {
      if (!this.apiKey || !this.baseId) {
        return null;
      }

      const response = await axios.get(
        `${this.baseUrl}/Projects`,
        {
          headers: this.getHeaders(),
          params: {
            filterByFormula: `{Project ID} = '${projectId}'`,
            maxRecords: 1
          }
        }
      );

      if (response.data.records && response.data.records.length > 0) {
        const record = response.data.records[0];
        return {
          airtableId: record.id,
          ...record.fields,
          phases: record.fields['Phases Data'] ? JSON.parse(record.fields['Phases Data']) : {},
          generatedFiles: record.fields['Generated Files'] ? JSON.parse(record.fields['Generated Files']) : []
        };
      }

      return null;
    } catch (error) {
      console.error('Airtable get project error:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Get all projects for a user
   */
  async getUserProjects(userId, userEmail) {
    try {
      if (!this.apiKey || !this.baseId) {
        return { success: false, error: 'Airtable not configured' };
      }

      const filterFormula = userId 
        ? `{User ID} = '${userId}'`
        : `{User Email} = '${userEmail}'`;

      const response = await axios.get(
        `${this.baseUrl}/Projects`,
        {
          headers: this.getHeaders(),
          params: {
            filterByFormula: filterFormula,
            sort: [{ field: 'Updated At', direction: 'desc' }],
            maxRecords: 100
          }
        }
      );

      const projects = response.data.records.map(record => ({
        airtableId: record.id,
        id: record.fields['Project ID'],
        projectName: record.fields['Project Name'],
        description: record.fields['Description'],
        currentPhase: record.fields['Current Phase'],
        status: record.fields['Status'],
        progress: record.fields['Progress'],
        createdAt: record.fields['Created At'],
        updatedAt: record.fields['Updated At'],
        completedAt: record.fields['Completed At'],
        tags: record.fields['Tags'] ? record.fields['Tags'].split(', ') : [],
        isPublic: record.fields['Is Public'],
        phases: record.fields['Phases Data'] ? JSON.parse(record.fields['Phases Data']) : {},
        generatedFiles: record.fields['Generated Files'] ? JSON.parse(record.fields['Generated Files']) : []
      }));

      return { success: true, projects };

    } catch (error) {
      console.error('Airtable get user projects error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save document to Airtable
   */
  async saveDocument(documentData) {
    try {
      if (!this.apiKey || !this.baseId) {
        throw new Error('Airtable not configured');
      }

      const record = {
        fields: {
          'Document ID': documentData.id,
          'Project ID': documentData.sessionId,
          'Project Name': documentData.projectName,
          'Phase': documentData.phase,
          'Document Type': documentData.documentType,
          'Content': documentData.content,
          'Summary': documentData.summary || '',
          'Word Count': documentData.metadata?.wordCount || 0,
          'Character Count': documentData.metadata?.characterCount || 0,
          'Tags': documentData.tags ? documentData.tags.join(', ') : '',
          'Created At': documentData.metadata?.createdAt || new Date().toISOString(),
          'User ID': documentData.metadata?.userId || '',
          'User Email': documentData.metadata?.userEmail || '',
          'Is Generated': documentData.metadata?.isGenerated || false,
          'Agent ID': documentData.metadata?.agentId || '',
          'Template Name': documentData.metadata?.templateName || ''
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/Documents`,
        record,
        { headers: this.getHeaders() }
      );

      return { success: true, data: response.data };

    } catch (error) {
      console.error('Airtable save document error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get documents for a project
   */
  async getProjectDocuments(projectId) {
    try {
      if (!this.apiKey || !this.baseId) {
        return { success: false, error: 'Airtable not configured' };
      }

      const response = await axios.get(
        `${this.baseUrl}/Documents`,
        {
          headers: this.getHeaders(),
          params: {
            filterByFormula: `{Project ID} = '${projectId}'`,
            sort: [{ field: 'Created At', direction: 'desc' }],
            maxRecords: 100
          }
        }
      );

      const documents = response.data.records.map(record => ({
        airtableId: record.id,
        id: record.fields['Document ID'],
        projectId: record.fields['Project ID'],
        projectName: record.fields['Project Name'],
        phase: record.fields['Phase'],
        documentType: record.fields['Document Type'],
        content: record.fields['Content'],
        summary: record.fields['Summary'],
        wordCount: record.fields['Word Count'],
        characterCount: record.fields['Character Count'],
        tags: record.fields['Tags'] ? record.fields['Tags'].split(', ') : [],
        createdAt: record.fields['Created At'],
        isGenerated: record.fields['Is Generated'],
        agentId: record.fields['Agent ID'],
        templateName: record.fields['Template Name']
      }));

      return { success: true, documents };

    } catch (error) {
      console.error('Airtable get project documents error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate project progress based on completed phases
   */
  calculateProgress(phases) {
    if (!phases) return 0;
    
    const phaseNames = ['analyst', 'pm', 'architect', 'designArchitect', 'po', 'sm'];
    const completedPhases = phaseNames.filter(phase => phases[phase]?.completed).length;
    
    return Math.round((completedPhases / phaseNames.length) * 100);
  }

  /**
   * Delete project from Airtable
   */
  async deleteProject(projectId) {
    try {
      if (!this.apiKey || !this.baseId) {
        throw new Error('Airtable not configured');
      }

      const existingProject = await this.getProjectById(projectId);
      if (!existingProject) {
        return { success: false, error: 'Project not found' };
      }

      await axios.delete(
        `${this.baseUrl}/Projects/${existingProject.airtableId}`,
        { headers: this.getHeaders() }
      );

      return { success: true };

    } catch (error) {
      console.error('Airtable delete project error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Search projects
   */
  async searchProjects(userId, query, filters = {}) {
    try {
      if (!this.apiKey || !this.baseId) {
        return { success: false, error: 'Airtable not configured' };
      }

      let filterFormula = `{User ID} = '${userId}'`;
      
      if (query) {
        filterFormula += ` AND (SEARCH('${query}', {Project Name}) > 0 OR SEARCH('${query}', {Description}) > 0)`;
      }

      if (filters.status) {
        filterFormula += ` AND {Status} = '${filters.status}'`;
      }

      if (filters.phase) {
        filterFormula += ` AND {Current Phase} = '${filters.phase}'`;
      }

      const response = await axios.get(
        `${this.baseUrl}/Projects`,
        {
          headers: this.getHeaders(),
          params: {
            filterByFormula: filterFormula,
            sort: [{ field: 'Updated At', direction: 'desc' }],
            maxRecords: 50
          }
        }
      );

      const projects = response.data.records.map(record => ({
        airtableId: record.id,
        id: record.fields['Project ID'],
        projectName: record.fields['Project Name'],
        description: record.fields['Description'],
        currentPhase: record.fields['Current Phase'],
        status: record.fields['Status'],
        progress: record.fields['Progress'],
        createdAt: record.fields['Created At'],
        updatedAt: record.fields['Updated At'],
        tags: record.fields['Tags'] ? record.fields['Tags'].split(', ') : []
      }));

      return { success: true, projects };

    } catch (error) {
      console.error('Airtable search projects error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = AirtableService;
