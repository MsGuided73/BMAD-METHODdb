// Knowledge Base utility functions for frontend

const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Auto-save document to knowledge base
 */
export const autoSaveToKnowledgeBase = async (documentData) => {
  try {
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/api/knowledge-base/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(documentData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('📚 Document auto-saved to knowledge base:', result.documentId);
      return { success: true, documentId: result.documentId };
    } else {
      console.error('❌ Failed to save to knowledge base:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('❌ Knowledge base save error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get project documents from knowledge base
 */
export const getProjectDocuments = async (sessionId) => {
  try {
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/api/knowledge-base/projects/${sessionId}`);
    const result = await response.json();
    
    if (result.success) {
      return { success: true, documents: result.documents };
    } else {
      console.error('Failed to get project documents:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Get project documents error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Search knowledge base
 */
export const searchKnowledgeBase = async (query, filters = {}) => {
  try {
    const apiUrl = getApiUrl();
    const params = new URLSearchParams();
    
    if (query) params.append('q', query);
    if (filters.phase) params.append('phase', filters.phase);
    if (filters.documentType) params.append('documentType', filters.documentType);
    if (filters.projectName) params.append('projectName', filters.projectName);

    const response = await fetch(`${apiUrl}/api/knowledge-base/search?${params}`);
    const result = await response.json();
    
    if (result.success) {
      return { success: true, results: result.results, count: result.count };
    } else {
      console.error('Knowledge base search failed:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Knowledge base search error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sync templates to knowledge base
 */
export const syncTemplatesToKnowledgeBase = async () => {
  try {
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/api/knowledge-base/sync-templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`📚 Synced ${result.syncedCount} templates to knowledge base`);
      return { success: true, syncedCount: result.syncedCount };
    } else {
      console.error('Template sync failed:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Template sync error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get knowledge base statistics
 */
export const getKnowledgeBaseStats = async () => {
  try {
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/api/knowledge-base/stats`);
    const result = await response.json();
    
    if (result.success) {
      return { success: true, stats: result.stats };
    } else {
      console.error('Failed to get KB stats:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('KB stats error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Auto-save session data when phase is completed
 */
export const autoSavePhaseCompletion = async (sessionData, phase, outputs) => {
  try {
    // Save each output document to knowledge base
    const savePromises = outputs.map(async (output) => {
      return autoSaveToKnowledgeBase({
        sessionId: sessionData.id,
        projectName: sessionData.projectName,
        phase: phase,
        documentType: output.type || 'phase-output',
        content: output.content || output.data,
        metadata: {
          phaseCompleted: true,
          outputType: output.type,
          completedAt: new Date().toISOString(),
          ...output.metadata
        }
      });
    });

    const results = await Promise.all(savePromises);
    const successCount = results.filter(r => r.success).length;
    
    console.log(`📚 Auto-saved ${successCount}/${outputs.length} phase outputs to knowledge base`);
    return { success: true, savedCount: successCount, totalCount: outputs.length };

  } catch (error) {
    console.error('Phase completion auto-save error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Auto-save chat interactions for context
 */
export const autoSaveChatInteraction = async (sessionId, projectName, phase, agentId, userMessage, aiResponse) => {
  try {
    const chatContent = `**User:** ${userMessage}

**AI Agent (${agentId}):** ${aiResponse}`;

    return autoSaveToKnowledgeBase({
      sessionId,
      projectName,
      phase,
      documentType: 'chat-interaction',
      content: chatContent,
      metadata: {
        agentId,
        interactionType: 'chat',
        timestamp: new Date().toISOString(),
        userMessage,
        aiResponse
      }
    });
  } catch (error) {
    console.error('Chat interaction auto-save error:', error);
    return { success: false, error: error.message };
  }
};
