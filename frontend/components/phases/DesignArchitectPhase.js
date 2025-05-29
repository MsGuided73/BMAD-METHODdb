import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import AIChat from '../AIChat';
import DocumentPreview from '../DocumentPreview';
import ChecklistValidator from '../ChecklistValidator';
import { ClipboardListIcon, CheckIcon, ChatIcon } from '../Icons';

export default function DesignArchitectPhase({ session, phaseData, onComplete, onDataUpdate }) {
  const [step, setStep] = useState('chat'); // chat, validation, complete
  const [frontendContent, setFrontendContent] = useState(phaseData.frontendContent || '');
  const [uiuxContent, setUiuxContent] = useState(phaseData.uiuxContent || '');
  const [checklistData, setChecklistData] = useState(phaseData.checklistData || null);

  const chatContext = {
    projectName: session.projectName,
    projectBrief: session.phases?.analyst?.outputs?.find(o => o.type === 'project-brief')?.content || '',
    prd: session.phases?.pm?.outputs?.find(o => o.type === 'prd')?.content || '',
    architecture: session.phases?.architect?.outputs?.find(o => o.type === 'architecture')?.content || '',
    phase: 'design-architect',
    sessionId: session.id
  };

  const handleContentGenerated = (content, templateName) => {
    // The AI agent can generate both frontend architecture and UI/UX spec
    // Check template name to determine which document was generated
    if (templateName && templateName.includes('frontend-architecture')) {
      setFrontendContent(content);
      setStep('validation');
      onDataUpdate({
        ...phaseData,
        frontendContent: content,
        uiuxContent,
        step: 'validation'
      });
    } else if (templateName && templateName.includes('uiux')) {
      setUiuxContent(content);
      setStep('validation');
      onDataUpdate({
        ...phaseData,
        frontendContent,
        uiuxContent: content,
        step: 'validation'
      });
    } else {
      // Default: treat as frontend architecture document
      setFrontendContent(content);
      setStep('validation');
      onDataUpdate({
        ...phaseData,
        frontendContent: content,
        uiuxContent,
        step: 'validation'
      });
    }
  };

  const handleChecklistComplete = (checklistResults) => {
    setChecklistData(checklistResults);
    setStep('complete');
    onDataUpdate({
      ...phaseData,
      frontendContent,
      uiuxContent,
      checklistData: checklistResults,
      step: 'complete'
    });
  };

  const handleCompletePhase = () => {
    const outputs = [];

    if (frontendContent) {
      outputs.push({
        type: 'frontend-architecture',
        content: frontendContent,
        filename: `${session.projectName.toLowerCase().replace(/\s+/g, '-')}-frontend-architecture.md`
      });
    }

    if (uiuxContent) {
      outputs.push({
        type: 'uiux-spec',
        content: uiuxContent,
        filename: `${session.projectName.toLowerCase().replace(/\s+/g, '-')}-uiux-spec.md`
      });
    }

    onComplete({
      frontendContent,
      uiuxContent,
      checklistData,
      step: 'complete'
    }, outputs);
  };

  const steps = [
    {
      id: 'chat',
      name: 'AI Consultation',
      description: 'Chat with your Design Architect & UI/UX Expert AI',
      icon: ChatIcon,
      color: 'pink'
    },
    {
      id: 'validation',
      name: 'Design Review',
      description: 'Validate frontend design and specifications',
      icon: ClipboardListIcon,
      color: 'yellow'
    },
    {
      id: 'complete',
      name: 'Phase Complete',
      description: 'Design approved and ready for product owner validation',
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
                <div className={`w-12 h-1 mx-2 ${
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
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
            <h4 className="font-medium text-pink-900 mb-2">AI Design Architect & UI/UX Expert</h4>
            <ul className="text-sm text-pink-800 space-y-1">
              <li>• Design frontend architecture and choose tech stack</li>
              <li>• Create comprehensive UI/UX specifications</li>
              <li>• Define component architecture and design systems</li>
              <li>• Ask for template generation when ready</li>
            </ul>
          </div>

          {/* 🎨 Enhanced Context Display Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            {session.phases?.architect?.outputs?.find(o => o.type === 'architecture') && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-3 flex items-center">
                  🏗️ System Architecture
                  <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    From Architect Phase
                  </span>
                </h4>
                <div className="text-sm text-purple-700 max-h-28 overflow-y-auto bg-white bg-opacity-50 rounded p-2">
                  <ReactMarkdown>
                    {session.phases.architect.outputs.find(o => o.type === 'architecture').content.slice(0, 400)}...
                  </ReactMarkdown>
                </div>
                <div className="mt-2 text-xs text-purple-600">
                  💡 Backend architecture foundation
                </div>
              </div>
            )}

            {session.phases?.pm?.outputs?.find(o => o.type === 'prd') && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium text-orange-900 mb-3 flex items-center">
                  📋 PRD Context
                  <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    From PM Phase
                  </span>
                </h4>
                <div className="text-sm text-orange-700 max-h-28 overflow-y-auto bg-white bg-opacity-50 rounded p-2">
                  <ReactMarkdown>
                    {session.phases.pm.outputs.find(o => o.type === 'prd').content.slice(0, 400)}...
                  </ReactMarkdown>
                </div>
                <div className="mt-2 text-xs text-orange-600">
                  💡 Feature requirements
                </div>
              </div>
            )}

            {session.phases?.analyst?.outputs?.find(o => o.type === 'project-brief') && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-3 flex items-center">
                  📋 Project Brief
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    From Analyst Phase
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
          </div>

          {/* 📊 Context Status Indicator */}
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
            <h5 className="font-medium text-pink-900 mb-2">📊 Available Context:</h5>
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
              <span className={`px-2 py-1 text-xs rounded-full ${
                session.phases?.architect?.outputs?.length > 0
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                ✓ System Architecture
              </span>
              <span className="px-2 py-1 text-xs rounded-full bg-pink-100 text-pink-800">
                🎯 Current: Frontend Design
              </span>
            </div>
          </div>

          <AIChat
            agentId="role-design-architect-uiux-&-frontend-strategy-expert"
            phase="design-architect"
            context={chatContext}
            onContentGenerated={handleContentGenerated}
          />
        </div>
      )}

      {step === 'validation' && (frontendContent || uiuxContent) && (
        <div className="space-y-6">
          {frontendContent && uiuxContent ? (
            <div className="grid md:grid-cols-2 gap-6">
              <DocumentPreview
                title="Frontend Architecture"
                content={frontendContent}
                filename={`${session.projectName.toLowerCase().replace(/\s+/g, '-')}-frontend-architecture.md`}
              />
              <DocumentPreview
                title="UI/UX Specification"
                content={uiuxContent}
                filename={`${session.projectName.toLowerCase().replace(/\s+/g, '-')}-uiux-spec.md`}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {frontendContent && (
                <DocumentPreview
                  title="Frontend Architecture Document"
                  content={frontendContent}
                  filename={`${session.projectName.toLowerCase().replace(/\s+/g, '-')}-frontend-architecture.md`}
                />
              )}
              {uiuxContent && (
                <DocumentPreview
                  title="UI/UX Specification Document"
                  content={uiuxContent}
                  filename={`${session.projectName.toLowerCase().replace(/\s+/g, '-')}-uiux-spec.md`}
                />
              )}
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={() => setStep('chat')}
              className="btn btn-secondary mr-4"
            >
              ← Back to Chat
            </button>
          </div>

          <ChecklistValidator
            checklistName="frontend-architecture-document-review-checklist.md"
            title="Frontend Design Review Checklist"
            description="Validate the frontend architecture and UI/UX specifications"
            onComplete={handleChecklistComplete}
          />
        </div>
      )}

      {step === 'complete' && (
        <div className="text-center space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <CheckIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Frontend Design Complete
            </h3>
            <p className="text-green-700">
              Your frontend architecture and UI/UX specifications are ready for validation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Generated Documents</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Frontend Architecture Document</li>
                <li>• UI/UX Specification Document</li>
                <li>• Design validation checklist</li>
              </ul>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Next Phase</h4>
              <p className="text-sm text-gray-600">
                Product Owner will validate all requirements and prepare for story creation.
              </p>
            </div>
          </div>

          <button
            onClick={handleCompletePhase}
            className="btn btn-primary btn-lg"
          >
            Complete Design Architect Phase
          </button>
        </div>
      )}
    </div>
  );
}
