const fs = require('fs');
const path = require('path');

/**
 * File Manager Service
 * Handles immediate generation and storage of .md files for each session
 */
class FileManager {
  constructor() {
    this.outputDir = path.join(__dirname, '../output');
    this.ensureOutputDirectory();
  }

  /**
   * Ensure the output directory exists
   */
  ensureOutputDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Get session-specific directory path
   */
  getSessionDirectory(sessionId) {
    return path.join(this.outputDir, 'sessions', sessionId);
  }

  /**
   * Ensure session directory exists
   */
  ensureSessionDirectory(sessionId) {
    const sessionDir = this.getSessionDirectory(sessionId);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }
    return sessionDir;
  }

  /**
   * Save generated content as .md file immediately
   */
  saveGeneratedFile(sessionId, filename, content, metadata = {}) {
    try {
      const sessionDir = this.ensureSessionDirectory(sessionId);
      const filePath = path.join(sessionDir, filename);
      
      // Add metadata header to the file
      const fileContent = this.addMetadataHeader(content, {
        ...metadata,
        generatedAt: new Date().toISOString(),
        sessionId,
        filename
      });

      fs.writeFileSync(filePath, fileContent, 'utf8');
      
      console.log(`✅ Generated file saved: ${filename} for session ${sessionId}`);
      
      return {
        success: true,
        filePath,
        filename,
        sessionId,
        size: Buffer.byteLength(fileContent, 'utf8'),
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error(`❌ Failed to save file ${filename}:`, error);
      throw new Error(`Failed to save file: ${error.message}`);
    }
  }

  /**
   * Add metadata header to file content
   */
  addMetadataHeader(content, metadata) {
    const header = `<!--
BMAD Method Generated Document
Generated: ${metadata.generatedAt}
Session: ${metadata.sessionId}
Phase: ${metadata.phase || 'unknown'}
Agent: ${metadata.agentId || 'unknown'}
Template: ${metadata.templateName || 'unknown'}
-->

`;
    return header + content;
  }

  /**
   * Read generated file content
   */
  readGeneratedFile(sessionId, filename) {
    try {
      const sessionDir = this.getSessionDirectory(sessionId);
      const filePath = path.join(sessionDir, filename);
      
      if (!fs.existsSync(filePath)) {
        return null;
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Remove metadata header for clean content
      const cleanContent = this.removeMetadataHeader(content);
      
      return {
        success: true,
        content: cleanContent,
        rawContent: content,
        filePath,
        filename,
        sessionId,
        stats: fs.statSync(filePath)
      };
    } catch (error) {
      console.error(`❌ Failed to read file ${filename}:`, error);
      return null;
    }
  }

  /**
   * Remove metadata header from content
   */
  removeMetadataHeader(content) {
    // Remove the metadata comment block
    return content.replace(/^<!--[\s\S]*?-->\s*\n\n/, '');
  }

  /**
   * List all generated files for a session
   */
  listSessionFiles(sessionId) {
    try {
      const sessionDir = this.getSessionDirectory(sessionId);
      
      if (!fs.existsSync(sessionDir)) {
        return [];
      }
      
      const files = fs.readdirSync(sessionDir)
        .filter(file => file.endsWith('.md'))
        .map(filename => {
          const filePath = path.join(sessionDir, filename);
          const stats = fs.statSync(filePath);
          
          return {
            filename,
            filePath,
            size: stats.size,
            createdAt: stats.birthtime.toISOString(),
            modifiedAt: stats.mtime.toISOString()
          };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return files;
    } catch (error) {
      console.error(`❌ Failed to list files for session ${sessionId}:`, error);
      return [];
    }
  }

  /**
   * Get full content of all generated files for context
   */
  getSessionContext(sessionId) {
    try {
      const files = this.listSessionFiles(sessionId);
      const context = {};
      
      files.forEach(file => {
        const fileData = this.readGeneratedFile(sessionId, file.filename);
        if (fileData && fileData.success) {
          // Use filename without extension as key
          const key = file.filename.replace('.md', '');
          context[key] = fileData.content;
        }
      });
      
      return context;
    } catch (error) {
      console.error(`❌ Failed to get session context for ${sessionId}:`, error);
      return {};
    }
  }

  /**
   * Delete a generated file
   */
  deleteGeneratedFile(sessionId, filename) {
    try {
      const sessionDir = this.getSessionDirectory(sessionId);
      const filePath = path.join(sessionDir, filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Deleted file: ${filename} for session ${sessionId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`❌ Failed to delete file ${filename}:`, error);
      return false;
    }
  }

  /**
   * Delete all files for a session
   */
  deleteSessionFiles(sessionId) {
    try {
      const sessionDir = this.getSessionDirectory(sessionId);
      
      if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true });
        console.log(`✅ Deleted all files for session ${sessionId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`❌ Failed to delete session files for ${sessionId}:`, error);
      return false;
    }
  }
}

module.exports = FileManager;
