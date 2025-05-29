import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import AIChat from '../AIChat';
import DocumentPreview from '../DocumentPreview';
import ChecklistValidator from '../ChecklistValidator';
import { DocumentIcon, ClipboardListIcon, CheckIcon, ChatIcon } from '../Icons';

export default function PMPhase({ session, phaseData, onComplete, onDataUpdate }) {
  const [step, setStep] = useState('chat'); // chat, validation, complete
  const [generatedContent, setGeneratedContent] = useState(phaseData.generatedContent || '');
  const [checklistData, setChecklistData] = useState(phaseData.checklistData || null);

  // 🏭 Extract industry insights from project brief
  const getIndustryInsights = () => {
    const projectBrief = session.phases?.analyst?.outputs?.find(o => o.type === 'project-brief')?.content || '';
    const projectName = session.projectName.toLowerCase();

    if (projectName.includes('ecommerce') || projectName.includes('shop') || projectBrief.toLowerCase().includes('ecommerce')) {
      return { industry: 'E-commerce', focus: 'Payment flows, inventory management, user conversion' };
    } else if (projectName.includes('fintech') || projectName.includes('finance') || projectBrief.toLowerCase().includes('fintech')) {
      return { industry: 'FinTech', focus: 'Security, compliance, real-time transactions' };
    } else if (projectName.includes('health') || projectName.includes('medical') || projectBrief.toLowerCase().includes('health')) {
      return { industry: 'HealthTech', focus: 'HIPAA compliance, patient workflows, data security' };
    } else if (projectName.includes('education') || projectName.includes('learning') || projectBrief.toLowerCase().includes('education')) {
      return { industry: 'EdTech', focus: 'Student privacy, accessibility, learning outcomes' };
    }
    return { industry: 'General', focus: 'User experience, scalability, performance' };
  };

  const industryInsights = getIndustryInsights();

  const chatContext = {
    projectName: session.projectName,
    projectBrief: session.phases?.analyst?.outputs?.find(o => o.type === 'project-brief')?.content || '',
    industryInsights,
    phase: 'pm',
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
      type: 'prd',
      content: generatedContent,
      filename: `${session.projectName.toLowerCase().replace(/\s+/g, '-')}-prd.md`
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
      description: 'Chat with your Product Manager AI',
      icon: ChatIcon,
      color: 'blue'
    },
    {
      id: 'validation',
      name: 'PRD Validation',
      description: 'Review and validate the Product Requirements Document',
      icon: ClipboardListIcon,
      color: 'yellow'
    },
    {
      id: 'complete',
      name: 'Phase Complete',
      description: 'PRD approved and ready for architecture phase',
      icon: CheckIcon,
      color: 'green'
    }
  ];



  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Manager Phase</h2>

      {/* Step Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">PM Phase Workflow</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {steps.map((stepOption) => (
            <button
              key={stepOption.id}
              onClick={() => setStep(stepOption.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                step === stepOption.id
                  ? `border-${stepOption.color}-500 bg-${stepOption.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center mb-2">
                <stepOption.icon className={`h-5 w-5 mr-2 ${
                  step === stepOption.id ? `text-${stepOption.color}-600` : 'text-gray-400'
                }`} />
                <span className={`font-medium ${
                  step === stepOption.id ? `text-${stepOption.color}-900` : 'text-gray-900'
                }`}>
                  {stepOption.name}
                </span>
              </div>
              <p className={`text-sm ${
                step === stepOption.id ? `text-${stepOption.color}-700` : 'text-gray-600'
              }`}>
                {stepOption.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {step === 'chat' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">AI Product Manager</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Define clear user stories and acceptance criteria</li>
              <li>• Specify functional and non-functional requirements</li>
              <li>• Create comprehensive Product Requirements Documents</li>
              <li>• Ask for PRD template generation when ready</li>
            </ul>
          </div>

          {/* 📋 Enhanced Context Display */}
          <div className="grid md:grid-cols-2 gap-4">
            {session.phases?.analyst?.outputs?.find(o => o.type === 'project-brief') && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-3 flex items-center">
                  📋 Project Brief Context
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    From Analyst Phase
                  </span>
                </h4>
                <div className="text-sm text-green-700 max-h-32 overflow-y-auto bg-white bg-opacity-50 rounded p-3">
                  <ReactMarkdown>
                    {session.phases.analyst.outputs.find(o => o.type === 'project-brief').content.slice(0, 600)}...
                  </ReactMarkdown>
                </div>
                <div className="mt-2 text-xs text-green-600">
                  💡 Business vision and project objectives
                </div>
              </div>
            )}

            {/* 🏭 Industry Insights Panel */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-3 flex items-center">
                🏭 Industry Focus: {industryInsights.industry}
                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  PM Considerations
                </span>
              </h4>
              <div className="text-sm text-purple-700 bg-white bg-opacity-50 rounded p-3">
                <p className="font-medium mb-2">Key PM Focus Areas:</p>
                <p>{industryInsights.focus}</p>
              </div>
              <div className="mt-2 text-xs text-purple-600">
                💡 Industry-specific requirements to consider in PRD
              </div>
            </div>
          </div>

          {/* 📊 Context Status Indicator */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h5 className="font-medium text-blue-900 mb-2">📊 Available Context:</h5>
            <div className="flex flex-wrap gap-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                session.phases?.analyst?.outputs?.length > 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                ✓ Project Brief
              </span>
              <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                ✓ Industry Insights
              </span>
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                🎯 Current: PRD Creation
              </span>
            </div>
          </div>

          <AIChat
            agentId="role-product-manager-(pm)-agent"
            phase="pm"
            context={chatContext}
            onContentGenerated={handleContentGenerated}
          />
        </div>
      )}

      {step === 'validation' && generatedContent && (
        <div className="space-y-6">
          <DocumentPreview
            title="Product Requirements Document"
            content={generatedContent}
            filename={`${session.projectName.toLowerCase().replace(/\s+/g, '-')}-prd.md`}
          />

          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setStep('chat')}
              className="btn btn-outline"
            >
              Back to Chat
            </button>
          </div>

          <ChecklistValidator
            checklistName="product-manager-(pm)-requirements-checklist.md"
            title="PM Requirements Checklist"
            description="Validate the PRD meets all product management standards"
            onComplete={handleChecklistComplete}
          />
        </div>
      )}

      {step === 'complete' && (
        <div className="text-center space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <CheckIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Product Requirements Document Complete
            </h3>
            <p className="text-green-700">
              Your PRD has been validated and is ready for the architecture phase.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Generated Documents</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Product Requirements Document (PRD)</li>
                <li>• Requirements validation checklist</li>
              </ul>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Next Phase</h4>
              <p className="text-sm text-gray-600">
                System Architect will design the technical architecture based on your requirements.
              </p>
            </div>
          </div>

          <button
            onClick={handleCompletePhase}
            className="btn btn-primary btn-lg"
          >
            Complete Product Manager Phase
          </button>
        </div>
      )}
    </div>
  );
}
