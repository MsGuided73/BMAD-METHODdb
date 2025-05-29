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

  const chatContext = {
    projectName: session.projectName,
    projectBrief: session.phases?.analyst?.outputs?.find(o => o.type === 'project-brief')?.content || '',
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

          {/* Show Project Brief Context */}
          {session.phases?.analyst?.outputs?.find(o => o.type === 'project-brief') && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Project Brief Reference</h4>
              <div className="text-sm text-gray-700 max-h-32 overflow-y-auto">
                <ReactMarkdown>
                  {session.phases.analyst.outputs.find(o => o.type === 'project-brief').content.slice(0, 500)}...
                </ReactMarkdown>
              </div>
            </div>
          )}

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
