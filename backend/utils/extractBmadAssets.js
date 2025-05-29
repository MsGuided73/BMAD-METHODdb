const fs = require('fs');
const path = require('path');

/**
 * Utility to extract BMAD assets from the consolidated .txt files
 * and organize them into structured data for the application
 */

class BmadAssetExtractor {
  constructor(sourceDir = '../../web-build-sample') {
    this.sourceDir = path.resolve(__dirname, sourceDir);
    this.outputDir = path.resolve(__dirname, '../data');
  }

  /**
   * Parse a consolidated .txt file and extract individual sections
   */
  parseConsolidatedFile(filePath, sectionMarker = '# ') {
    const content = fs.readFileSync(filePath, 'utf8');
    const sections = {};
    const lines = content.split('\n');

    let currentSection = null;
    let currentContent = [];

    for (const line of lines) {
      if (line.startsWith(sectionMarker)) {
        // Save previous section
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n').trim();
        }

        // Start new section
        currentSection = line.replace(sectionMarker, '').trim();
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    }

    // Save last section
    if (currentSection) {
      sections[currentSection] = currentContent.join('\n').trim();
    }

    return sections;
  }

  /**
   * Sanitize filename for cross-platform compatibility
   */
  sanitizeFilename(name) {
    return name
      .toLowerCase()
      .replace(/[{}\[\]]/g, '') // Remove brackets and braces
      .replace(/[\/\\:*?"<>|]/g, '') // Remove invalid file path characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Extract templates from templates.txt
   */
  extractTemplates() {
    const templatesFile = path.join(this.sourceDir, 'templates.txt');
    const templates = this.parseConsolidatedFile(templatesFile);

    // Create templates directory
    const templatesDir = path.join(this.outputDir, 'templates');
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }

    // Save each template as individual file
    for (const [name, content] of Object.entries(templates)) {
      const filename = this.sanitizeFilename(name) + '.md';
      fs.writeFileSync(path.join(templatesDir, filename), content);
    }

    return templates;
  }

  /**
   * Extract checklists from checklists.txt
   */
  extractChecklists() {
    const checklistsFile = path.join(this.sourceDir, 'checklists.txt');
    const checklists = this.parseConsolidatedFile(checklistsFile);

    // Create checklists directory
    const checklistsDir = path.join(this.outputDir, 'checklists');
    if (!fs.existsSync(checklistsDir)) {
      fs.mkdirSync(checklistsDir, { recursive: true });
    }

    // Save each checklist as individual file
    for (const [name, content] of Object.entries(checklists)) {
      const filename = this.sanitizeFilename(name) + '.md';
      fs.writeFileSync(path.join(checklistsDir, filename), content);
    }

    return checklists;
  }

  /**
   * Extract personas from personas.txt
   */
  extractPersonas() {
    const personasFile = path.join(this.sourceDir, 'personas.txt');
    const personas = this.parseConsolidatedFile(personasFile);

    // Create personas directory
    const personasDir = path.join(this.outputDir, 'personas');
    if (!fs.existsSync(personasDir)) {
      fs.mkdirSync(personasDir, { recursive: true });
    }

    // Save each persona as individual file
    for (const [name, content] of Object.entries(personas)) {
      const filename = this.sanitizeFilename(name) + '.md';
      fs.writeFileSync(path.join(personasDir, filename), content);
    }

    return personas;
  }

  /**
   * Extract tasks from tasks.txt
   */
  extractTasks() {
    const tasksFile = path.join(this.sourceDir, 'tasks.txt');
    const tasks = this.parseConsolidatedFile(tasksFile);

    // Create tasks directory
    const tasksDir = path.join(this.outputDir, 'tasks');
    if (!fs.existsSync(tasksDir)) {
      fs.mkdirSync(tasksDir, { recursive: true });
    }

    // Save each task as individual file
    for (const [name, content] of Object.entries(tasks)) {
      const filename = this.sanitizeFilename(name) + '.md';
      fs.writeFileSync(path.join(tasksDir, filename), content);
    }

    return tasks;
  }

  /**
   * Extract agent configuration
   */
  extractAgentConfig() {
    const configFile = path.join(this.sourceDir, 'agent-config.txt');
    const config = fs.readFileSync(configFile, 'utf8');

    // Create config directory
    const configDir = path.join(this.outputDir, 'config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(path.join(configDir, 'agent-config.md'), config);

    return config;
  }

  /**
   * Extract all assets
   */
  extractAll() {
    console.log('🔄 Extracting BMAD assets...');

    const results = {
      templates: this.extractTemplates(),
      checklists: this.extractChecklists(),
      personas: this.extractPersonas(),
      tasks: this.extractTasks(),
      config: this.extractAgentConfig()
    };

    console.log('✅ BMAD assets extracted successfully!');
    console.log(`📁 Templates: ${Object.keys(results.templates).length}`);
    console.log(`📋 Checklists: ${Object.keys(results.checklists).length}`);
    console.log(`👤 Personas: ${Object.keys(results.personas).length}`);
    console.log(`📝 Tasks: ${Object.keys(results.tasks).length}`);

    return results;
  }
}

module.exports = BmadAssetExtractor;

// Run extraction if called directly
if (require.main === module) {
  const extractor = new BmadAssetExtractor();
  extractor.extractAll();
}
