import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { DocumentIcon, EyeIcon } from '../components/Icons';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTemplate = async (templateName) => {
    try {
      const response = await fetch(`/api/templates/${encodeURIComponent(templateName)}`);
      const data = await response.json();
      setSelectedTemplate(data);
    } catch (error) {
      console.error('Failed to load template:', error);
    }
  };

  const templateCategories = {
    'project-brief': 'Project Planning',
    'prd': 'Product Management',
    'architecture': 'System Architecture',
    'frontend': 'Frontend Development',
    'uiux': 'UI/UX Design',
    'story': 'Agile Development'
  };

  const getTemplateCategory = (templateName) => {
    const name = templateName.toLowerCase();
    if (name.includes('project-brief')) return 'project-brief';
    if (name.includes('prd') || name.includes('requirements')) return 'prd';
    if (name.includes('architecture') && !name.includes('frontend')) return 'architecture';
    if (name.includes('frontend')) return 'frontend';
    if (name.includes('uiux') || name.includes('ui-ux')) return 'uiux';
    if (name.includes('story')) return 'story';
    return 'other';
  };

  const groupedTemplates = templates.reduce((acc, template) => {
    const category = getTemplateCategory(template.name);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {});

  return (
    <>
      <Head>
        <title>BMAD Templates - Planning Application</title>
        <meta name="description" content="Browse and explore BMAD Method templates for project planning" />
      </Head>
      
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">BMAD Templates</h1>
              <p className="text-lg text-gray-600">
                Explore the comprehensive collection of templates used in the BMAD Method planning process
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-600">Loading templates...</span>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Template List */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Available Templates ({templates.length})
                      </h2>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
                        <div key={category} className="border-b border-gray-200 last:border-b-0">
                          <div className="p-3 bg-gray-50">
                            <h3 className="text-sm font-medium text-gray-700">
                              {templateCategories[category] || 'Other Templates'}
                            </h3>
                          </div>
                          <div className="divide-y divide-gray-200">
                            {categoryTemplates.map((template) => (
                              <button
                                key={template.name}
                                onClick={() => handleViewTemplate(template.name)}
                                className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                                  selectedTemplate?.name === template.name ? 'bg-primary-50 border-r-2 border-primary-500' : ''
                                }`}
                              >
                                <div className="flex items-center">
                                  <DocumentIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                      {template.name.replace(/\.md$/, '').replace(/-/g, ' ')}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {template.placeholders?.length || 0} fields
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Template Preview */}
                <div className="lg:col-span-2">
                  {selectedTemplate ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                              {selectedTemplate.name.replace(/\.md$/, '').replace(/-/g, ' ')}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                              {selectedTemplate.placeholders?.length || 0} dynamic fields
                            </p>
                          </div>
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      {/* Template Fields */}
                      {selectedTemplate.placeholders && selectedTemplate.placeholders.length > 0 && (
                        <div className="p-4 border-b border-gray-200">
                          <h3 className="text-md font-medium text-gray-900 mb-3">Template Fields</h3>
                          <div className="grid md:grid-cols-2 gap-3">
                            {selectedTemplate.placeholders.map((placeholder, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {placeholder.replace(/[{}]/g, '').replace(/-/g, ' ')}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Dynamic field
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Template Content */}
                      <div className="p-4">
                        <h3 className="text-md font-medium text-gray-900 mb-3">Template Content</h3>
                        <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                            {selectedTemplate.content}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                      <DocumentIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Select a Template
                      </h3>
                      <p className="text-gray-600">
                        Choose a template from the list to view its content and structure
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Template Info */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">About BMAD Templates</h3>
              <p className="text-blue-800 mb-4">
                These templates are the foundation of the BMAD Method planning process. Each template contains 
                dynamic placeholders that are filled during the planning wizard to create comprehensive project documentation.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Template Features</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Dynamic placeholder replacement</li>
                    <li>• Structured markdown format</li>
                    <li>• Professional documentation standards</li>
                    <li>• LLM-optimized content structure</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Usage in BMAD Process</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Analyst: Project brief templates</li>
                    <li>• PM: Requirements and PRD templates</li>
                    <li>• Architect: System design templates</li>
                    <li>• Design: UI/UX specification templates</li>
                    <li>• SM: User story templates</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
