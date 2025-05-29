import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import AIChat from '../AIChat';
import DocumentPreview from '../DocumentPreview';
import ChecklistValidator from '../ChecklistValidator';
import { ClipboardListIcon, CheckIcon, ChatIcon } from '../Icons';

export default function ArchitectPhase({ session, phaseData, onComplete, onDataUpdate }) {
  const [step, setStep] = useState('chat'); // chat, validation, complete
  const [generatedContent, setGeneratedContent] = useState(phaseData.generatedContent || '');
  const [checklistData, setChecklistData] = useState(phaseData.checklistData || null);

  // 🏭 Extract industry insights for architecture considerations
  const getArchitectureInsights = () => {
    const projectBrief = session.phases?.analyst?.outputs?.find(o => o.type === 'project-brief')?.content || '';
    const prd = session.phases?.pm?.outputs?.find(o => o.type === 'prd')?.content || '';
    const projectName = session.projectName.toLowerCase();

    if (projectName.includes('ecommerce') || projectBrief.toLowerCase().includes('ecommerce') || prd.toLowerCase().includes('ecommerce')) {
      return { industry: 'E-commerce', focus: 'Scalable payment processing, inventory systems, CDN for product images' };
    } else if (projectName.includes('fintech') || projectBrief.toLowerCase().includes('fintech') || prd.toLowerCase().includes('finance')) {
      return { industry: 'FinTech', focus: 'High-security architecture, real-time processing, audit trails' };
    } else if (projectName.includes('health') || projectBrief.toLowerCase().includes('health') || prd.toLowerCase().includes('medical')) {
      return { industry: 'HealthTech', focus: 'HIPAA-compliant infrastructure, encrypted data storage, secure APIs' };
    } else if (projectName.includes('education') || projectBrief.toLowerCase().includes('education') || prd.toLowerCase().includes('learning')) {
      return { industry: 'EdTech', focus: 'Scalable content delivery, user management, accessibility compliance' };
    }
    return { industry: 'General', focus: 'Scalable microservices, secure APIs, performance optimization' };
  };

  const architectureInsights = getArchitectureInsights();

  const chatContext = {
    projectName: session.projectName,
    projectBrief: session.phases?.analyst?.outputs?.find(o => o.type === 'project-brief')?.content || '',
    prd: session.phases?.pm?.outputs?.find(o => o.type === 'prd')?.content || '',
    architectureInsights,
    phase: 'architect',
    sessionId: session.id
  };

  const handleContentGenerated = (content, templateName) => {
    setGeneratedContent(content);
    setStep('validation');
    onDataUpdate({
      ...phaseData,
      generatedContent: content,
      templateName,
      step: 'validation'
    });
  };

  const handleChecklistComplete = (checklistResults) => {
    setChecklistData(checklistResults);
    setStep('complete');
    onDataUpdate({
      ...phaseData,
      generatedContent,
      checklistData: checklistResults,
      step: 'complete'
    });
  };

  const handleCompletePhase = () => {
    const outputs = [{
      type: 'architecture',
      content: generatedContent,
      filename: `${session.projectName.toLowerCase().replace(/\s+/g, '-')}-architecture.md`
    }];

    onComplete({
      generatedContent,
      checklistData,
      step: 'complete'
    }, outputs);
  };

  const steps = [
    {
      id: 'chat',
      name: 'AI Consultation',
      description: 'Chat with your System Architect AI',
      icon: ChatIcon,
      color: 'purple'
    },
    {
      id: 'validation',
      name: 'Architecture Review',
      description: 'Validate architecture design and technical decisions',
      icon: ClipboardListIcon,
      color: 'yellow'
    },
    {
      id: 'complete',
      name: 'Phase Complete',
      description: 'Architecture approved and ready for frontend design',
      icon: CheckIcon,
      color: 'green'
    }
  ];

  return (
    <div className="p-6">
      {/* Step Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((stepOption, index) => (
            <div key={stepOption.id} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step === stepOption.id
                    ? `bg-${stepOption.color}-500 text-white`
                    : steps.findIndex(s => s.id === step) > index
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                <stepOption.icon className="h-5 w-5" />
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-2 ${
                  steps.findIndex(s => s.id === step) > index
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {steps.find(s => s.id === step)?.name}
          </h3>
          <p className="text-gray-600">
            {steps.find(s => s.id === step)?.description}
          </p>
        </div>
      </div>

      {/* Step Content */}
      {step === 'chat' && (
        <div className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">AI System Architect</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Design scalable and maintainable system architecture</li>
              <li>• Define data models, APIs, and service boundaries</li>
              <li>• Consider security, performance, and reliability requirements</li>
              <li>• Ask for architecture template generation when ready</li>
            </ul>
          </div>

          {/* 🏗️ Enhanced Context Display */}
          <div className="grid md:grid-cols-3 gap-4">
            {session.phases?.pm?.outputs?.find(o => o.type === 'prd') && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium text-orange-900 mb-3 flex items-center">
                  📋 PRD Context
                  <span className="ml-2 px-1 py-0.5 bg-orange-100 text-orange-800 text-xs rounded">
                    PM Phase
                  </span>
                </h4>
                <div className="text-sm text-orange-700 max-h-28 overflow-y-auto bg-white bg-opacity-50 rounded p-2">
                  <ReactMarkdown>
                    {session.phases.pm.outputs.find(o => o.type === 'prd').content.slice(0, 400)}...
                  </ReactMarkdown>
                </div>
                <div className="mt-2 text-xs text-orange-600">
                  💡 Technical requirements
                </div>
              </div>
            )}

            {session.phases?.analyst?.outputs?.find(o => o.type === 'project-brief') && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-3 flex items-center">
                  📋 Project Brief
                  <span className="ml-2 px-1 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                    Analyst Phase
                  </span>
                </h4>
                <div className="text-sm text-green-700 max-h-28 overflow-y-auto bg-white bg-opacity-50 rounded p-2">
                  <ReactMarkdown>
                    {session.phases.analyst.outputs.find(o => o.type === 'project-brief').content.slice(0, 400)}...
                  </ReactMarkdown>
                </div>
                <div className="mt-2 text-xs text-green-600">
                  💡 Business vision
                </div>
              </div>
            )}

            {/* 🏭 Industry Architecture Insights */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-3 flex items-center">
                🏗️ {architectureInsights.industry} Architecture
                <span className="ml-2 px-1 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">
                  Industry Focus
                </span>
              </h4>
              <div className="text-sm text-purple-700 bg-white bg-opacity-50 rounded p-2">
                <p className="font-medium mb-1">Architecture Priorities:</p>
                <p className="text-xs">{architectureInsights.focus}</p>
              </div>
              <div className="mt-2 text-xs text-purple-600">
                💡 Industry-specific architecture considerations
              </div>
            </div>
          </div>

          {/* 📊 Context Status Indicator */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <h5 className="font-medium text-purple-900 mb-2">📊 Available Context:</h5>
            <div className="flex flex-wrap gap-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                session.phases?.analyst?.outputs?.length > 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                ✓ Project Brief
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                session.phases?.pm?.outputs?.length > 0
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                ✓ PRD
              </span>
              <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                ✓ Industry Architecture Insights
              </span>
              <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                🎯 Current: System Architecture
              </span>
            </div>
          </div>

          <AIChat
            agentId="role-architect-agent"
            phase="architect"
            context={chatContext}
            onContentGenerated={handleContentGenerated}
          />
        </div>
      )}

      {step === 'validation' && generatedContent && (
        <div className="space-y-6">
          <DocumentPreview
            title="System Architecture Document"
            content={generatedContent}
            filename={`${session.projectName.toLowerCase().replace(/\s+/g, '-')}-architecture.md`}
          />

          <div className="flex justify-center">
            <button
              onClick={() => setStep('chat')}
              className="btn btn-secondary mr-4"
            >
              ← Back to Chat
            </button>
          </div>

          <ChecklistValidator
            checklistName="architect-solution-validation-checklist.md"
            title="Architecture Validation Checklist"
            description="Validate the system architecture meets all technical requirements"
            onComplete={handleChecklistComplete}
          />
        </div>
      )}

      {step === 'complete' && (
        <div className="text-center space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <CheckIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              System Architecture Complete
            </h3>
            <p className="text-green-700">
              Your system architecture has been validated and is ready for frontend design.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Generated Documents</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• System Architecture Document</li>
                <li>• Architecture validation checklist</li>
              </ul>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Next Phase</h4>
              <p className="text-sm text-gray-600">
                Design Architect will create UI/UX specifications and frontend architecture.
              </p>
            </div>
          </div>

          <button
            onClick={handleCompletePhase}
            className="btn btn-primary btn-lg"
          >
            Complete System Architect Phase
          </button>
        </div>
      )}
    </div>
  );
}
