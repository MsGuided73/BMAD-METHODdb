const fs = require('fs');
const path = require('path');

/**
 * Template Parser - Extracts placeholders and generates dynamic forms
 */
class TemplateParser {
  constructor() {
    this.templatesDir = path.join(__dirname, '../data/templates');
  }

  /**
   * Extract placeholders from template content
   * Supports formats: {placeholder}, {{placeholder}}, [placeholder]
   */
  extractPlaceholders(content) {
    const placeholders = new Set();
    
    // Match various placeholder formats
    const patterns = [
      /\{([^}]+)\}/g,           // {placeholder}
      /\{\{([^}]+)\}\}/g,       // {{placeholder}}
      /\[([^\]]+)\]/g,          // [placeholder]
      /\$\{([^}]+)\}/g,         // ${placeholder}
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const placeholder = match[1].trim();
        // Skip common markdown/code patterns
        if (!this.isCodePattern(placeholder)) {
          placeholders.add(placeholder);
        }
      }
    });
    
    return Array.from(placeholders);
  }

  /**
   * Check if placeholder is likely a code pattern to ignore
   */
  isCodePattern(placeholder) {
    const codePatterns = [
      /^[0-9]+$/,                    // Just numbers
      /^[a-z]+\([^)]*\)$/,          // Function calls
      /^[A-Z_]+$/,                  // Constants
      /^[a-z]+\.[a-z]+/,            // Object properties
      /^if|for|while|function/,      // Code keywords
    ];
    
    return codePatterns.some(pattern => pattern.test(placeholder));
  }

  /**
   * Analyze placeholder to determine form field type
   */
  analyzeFieldType(placeholder) {
    const lower = placeholder.toLowerCase();
    
    // Field type mapping based on placeholder name
    if (lower.includes('email')) return 'email';
    if (lower.includes('url') || lower.includes('link')) return 'url';
    if (lower.includes('date')) return 'date';
    if (lower.includes('number') || lower.includes('count') || lower.includes('version')) return 'number';
    if (lower.includes('description') || lower.includes('details') || lower.includes('summary')) return 'textarea';
    if (lower.includes('list') || lower.includes('items') || lower.includes('features')) return 'textarea';
    if (lower.includes('password')) return 'password';
    if (lower.includes('phone')) return 'tel';
    
    // Default to text
    return 'text';
  }

  /**
   * Generate form field configuration from placeholder
   */
  generateFieldConfig(placeholder) {
    const fieldType = this.analyzeFieldType(placeholder);
    const label = this.generateLabel(placeholder);
    const name = this.generateFieldName(placeholder);
    
    const config = {
      name,
      label,
      type: fieldType,
      required: true,
      placeholder: `Enter ${label.toLowerCase()}...`
    };

    // Add specific configurations based on type
    switch (fieldType) {
      case 'textarea':
        config.rows = 4;
        config.placeholder = `Describe ${label.toLowerCase()}...`;
        break;
      case 'number':
        config.min = 0;
        break;
      case 'email':
        config.placeholder = 'user@example.com';
        break;
      case 'url':
        config.placeholder = 'https://example.com';
        break;
    }

    return config;
  }

  /**
   * Generate human-readable label from placeholder
   */
  generateLabel(placeholder) {
    return placeholder
      .replace(/[-_]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Generate form field name from placeholder
   */
  generateFieldName(placeholder) {
    return placeholder
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * Parse template file and generate form schema
   */
  parseTemplate(templateName) {
    const templatePath = path.join(this.templatesDir, templateName);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templateName}`);
    }
    
    const content = fs.readFileSync(templatePath, 'utf8');
    const placeholders = this.extractPlaceholders(content);
    
    const formSchema = {
      templateName,
      title: this.generateLabel(templateName.replace('.md', '')),
      fields: placeholders.map(placeholder => this.generateFieldConfig(placeholder)),
      sections: this.extractSections(content)
    };
    
    return formSchema;
  }

  /**
   * Extract sections from template for better organization
   */
  extractSections(content) {
    const sections = [];
    const lines = content.split('\n');
    let currentSection = null;
    
    for (const line of lines) {
      if (line.startsWith('#')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: line.replace(/^#+\s*/, ''),
          content: [],
          placeholders: []
        };
      } else if (currentSection) {
        currentSection.content.push(line);
        // Extract placeholders from this line
        const linePlaceholders = this.extractPlaceholders(line);
        currentSection.placeholders.push(...linePlaceholders);
      }
    }
    
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return sections;
  }

  /**
   * Fill template with provided values
   */
  fillTemplate(templateName, values) {
    const templatePath = path.join(this.templatesDir, templateName);
    let content = fs.readFileSync(templatePath, 'utf8');
    
    // Replace placeholders with values
    Object.entries(values).forEach(([key, value]) => {
      const patterns = [
        new RegExp(`\\{${key}\\}`, 'g'),
        new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
        new RegExp(`\\[${key}\\]`, 'g'),
        new RegExp(`\\$\\{${key}\\}`, 'g'),
      ];
      
      patterns.forEach(pattern => {
        content = content.replace(pattern, value || '');
      });
    });
    
    return content;
  }

  /**
   * Get all available templates
   */
  getAvailableTemplates() {
    const templates = fs.readdirSync(this.templatesDir)
      .filter(file => file.endsWith('.md'))
      .map(file => ({
        name: file,
        title: this.generateLabel(file.replace('.md', '')),
        path: file
      }));
    
    return templates;
  }
}

module.exports = TemplateParser;
