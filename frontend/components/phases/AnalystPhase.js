import { useState, useRef } from 'react';
import AIChat from '../AIChat';
import DocumentPreview from '../DocumentPreview';
import { DocumentIcon, CheckIcon, ChatIcon } from '../Icons';

export default function AnalystPhase({ session, phaseData, onComplete, onDataUpdate }) {
  const [mode, setMode] = useState('chat'); // chat, preview, complete
  const [generatedContent, setGeneratedContent] = useState(phaseData.generatedContent || '');
  const aiChatRef = useRef();

  // 🏭 INDUSTRY-SPECIFIC CONTEXT - Enhanced context for better business analysis
  const getIndustryContext = (projectName) => {
    const name = projectName.toLowerCase();

    // Industry detection based on project name keywords
    if (name.includes('ecommerce') || name.includes('shop') || name.includes('store') || name.includes('marketplace')) {
      return {
        industry: 'E-commerce',
        keyConsiderations: [
          'Payment processing and security compliance',
          'Inventory management and order fulfillment',
          'Customer acquisition and retention strategies',
          'Mobile-first shopping experience',
          'Search and recommendation algorithms'
        ],
        competitorAnalysis: 'Amazon, Shopify, WooCommerce, BigCommerce',
        regulatoryFactors: 'PCI DSS compliance, GDPR, consumer protection laws'
      };
    } else if (name.includes('fintech') || name.includes('banking') || name.includes('finance') || name.includes('payment')) {
      return {
        industry: 'FinTech',
        keyConsiderations: [
          'Regulatory compliance and licensing',
          'Security and fraud prevention',
          'Real-time transaction processing',
          'KYC/AML requirements',
          'API integrations with financial institutions'
        ],
        competitorAnalysis: 'Stripe, Square, PayPal, Plaid, Robinhood',
        regulatoryFactors: 'PCI DSS, SOX, GDPR, PSD2, banking regulations'
      };
    } else if (name.includes('health') || name.includes('medical') || name.includes('telemedicine') || name.includes('healthcare')) {
      return {
        industry: 'HealthTech',
        keyConsiderations: [
          'HIPAA compliance and patient privacy',
          'Medical data security and encryption',
          'Integration with EHR systems',
          'Telemedicine capabilities',
          'Clinical workflow optimization'
        ],
        competitorAnalysis: 'Epic, Cerner, Teladoc, Amwell, Doxy.me',
        regulatoryFactors: 'HIPAA, FDA regulations, state medical licensing'
      };
    } else if (name.includes('education') || name.includes('learning') || name.includes('course') || name.includes('school')) {
      return {
        industry: 'EdTech',
        keyConsiderations: [
          'Student data privacy (FERPA compliance)',
          'Accessibility and inclusive design',
          'Learning analytics and progress tracking',
          'Content management and delivery',
          'Integration with LMS platforms'
        ],
        competitorAnalysis: 'Canvas, Blackboard, Coursera, Udemy, Khan Academy',
        regulatoryFactors: 'FERPA, COPPA, accessibility standards (WCAG)'
      };
    } else if (name.includes('saas') || name.includes('software') || name.includes('platform') || name.includes('tool')) {
      return {
        industry: 'SaaS/Software',
        keyConsiderations: [
          'Scalable multi-tenant architecture',
          'Subscription billing and pricing models',
          'API-first design and integrations',
          'User onboarding and adoption',
          'Data analytics and reporting'
        ],
        competitorAnalysis: 'Salesforce, HubSpot, Slack, Notion, Airtable',
        regulatoryFactors: 'GDPR, SOC 2 compliance, data residency requirements'
      };
    }

    // Default general business context
    return {
      industry: 'General Business',
      keyConsiderations: [
        'User experience and interface design',
        'Scalability and performance requirements',
        'Data security and privacy protection',
        'Integration capabilities',
        'Market differentiation strategies'
      ],
      competitorAnalysis: 'Research direct and indirect competitors in your market',
      regulatoryFactors: 'GDPR, accessibility standards, industry-specific regulations'
    };
  };

  const industryContext = getIndustryContext(session.projectName);

  const chatContext = {
    projectName: session.projectName,
    phase: 'analyst',
    sessionId: session.id,
    industryContext
  };

  const handleContentGenerated = (content, templateName) => {
    setGeneratedContent(content);
    setMode('preview');
    onDataUpdate({
      ...phaseData,
      generatedContent: content,
      templateName,
      mode: 'preview'
    });
  };

  const handleGenerateTemplate = async () => {
    if (aiChatRef.current && aiChatRef.current.generateTemplate) {
      await aiChatRef.current.generateTemplate('project-brief');
    }
  };

  const handleCompletePhase = () => {
    const outputs = [{
      type: 'project-brief',
      content: generatedContent,
      filename: `${session.projectName.toLowerCase().replace(/\s+/g, '-')}-project-brief.md`
    }];

    onComplete({ generatedContent, mode }, outputs);
  };

  const modes = [
    {
      id: 'chat',
      name: 'AI Consultation',
      description: 'Chat with your Business Analyst & Research Expert',
      icon: ChatIcon,
      color: 'blue'
    },
    {
      id: 'preview',
      name: 'Document Preview',
      description: 'Review generated project brief',
      icon: DocumentIcon,
      color: 'green'
    },
    {
      id: 'complete',
      name: 'Phase Complete',
      description: 'Finalize and proceed to next phase',
      icon: CheckIcon,
      color: 'purple'
    }
  ];

  return (
    <div className="p-6">
      {/* Mode Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analyst Phase Workflow</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {modes.map((modeOption) => (
            <button
              key={modeOption.id}
              onClick={() => setMode(modeOption.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                mode === modeOption.id
                  ? `border-${modeOption.color}-500 bg-${modeOption.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center mb-2">
                <modeOption.icon className={`h-5 w-5 mr-2 ${
                  mode === modeOption.id ? `text-${modeOption.color}-600` : 'text-gray-400'
                }`} />
                <span className={`font-medium ${
                  mode === modeOption.id ? `text-${modeOption.color}-900` : 'text-gray-900'
                }`}>
                  {modeOption.name}
                </span>
              </div>
              <p className={`text-sm ${
                mode === modeOption.id ? `text-${modeOption.color}-700` : 'text-gray-600'
              }`}>
                {modeOption.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Mode-Specific Content */}
      {mode === 'chat' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">AI Business Analyst & Research Expert</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Brainstorm project ideas and define vision</li>
              <li>• Conduct market research and competitive analysis</li>
              <li>• Create comprehensive project briefs</li>
              <li>• Ask for template generation when ready</li>
            </ul>
          </div>

          {/* 🏭 Industry-Specific Context Display */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-3 flex items-center">
              🏭 Detected Industry: {industryContext.industry}
            </h4>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-purple-800 mb-2">Key Considerations:</h5>
                <ul className="text-sm text-purple-700 space-y-1">
                  {industryContext.keyConsiderations.map((consideration, index) => (
                    <li key={index}>• {consideration}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-medium text-purple-800 mb-2">Regulatory Factors:</h5>
                <p className="text-sm text-purple-700 mb-3">{industryContext.regulatoryFactors}</p>

                <h5 className="font-medium text-purple-800 mb-2">Competitor Analysis:</h5>
                <p className="text-sm text-purple-700">{industryContext.competitorAnalysis}</p>
              </div>
            </div>
          </div>

          <AIChat
            agentId="role-analyst-a-brainstorming-ba-and-ra-expert"
            phase="analyst"
            context={chatContext}
            onContentGenerated={handleContentGenerated}
            ref={aiChatRef}
          />

          {/* 🚀 Template Generation Button */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Ready to Generate Project Brief?</h4>
                <p className="text-sm text-blue-700">Click below to generate and save your project brief template</p>
              </div>
              <button
                onClick={handleGenerateTemplate}
                className="btn btn-primary"
                disabled={!chatContext.projectName}
              >
                Generate Project Brief
              </button>
            </div>
          </div>
        </div>
      )}

      {mode === 'preview' && generatedContent && (
        <div className="space-y-6">
          <DocumentPreview
            title="Project Brief"
            content={generatedContent}
            filename={`${session.projectName.toLowerCase().replace(/\s+/g, '-')}-project-brief.md`}
          />

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setMode('chat')}
              className="btn btn-outline"
            >
              Back to Chat
            </button>
            <button
              onClick={() => setMode('complete')}
              className="btn btn-primary"
            >
              Approve & Continue
            </button>
          </div>
        </div>
      )}

      {mode === 'complete' && (
        <div className="text-center space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <CheckIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Analyst Phase Complete
            </h3>
            <p className="text-green-700">
              Your project brief has been created and is ready for the Product Manager phase.
            </p>
          </div>

          <button
            onClick={handleCompletePhase}
            className="btn btn-primary btn-lg"
          >
            Complete Analyst Phase
          </button>
        </div>
      )}

    </div>
  );
}
