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

  const chatContext = {
    projectName: session.projectName,
    projectBrief: session.phases?.analyst?.outputs?.find(o => o.type === 'project-brief')?.content || '',
    prd: session.phases?.pm?.outputs?.find(o => o.type === 'prd')?.content || '',
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

          {/* Show PRD Context */}
          {session.phases?.pm?.outputs?.find(o => o.type === 'prd') && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">PRD Reference</h4>
              <div className="text-sm text-gray-700 max-h-32 overflow-y-auto">
                <ReactMarkdown>
                  {session.phases.pm.outputs.find(o => o.type === 'prd').content.slice(0, 500)}...
                </ReactMarkdown>
              </div>
            </div>
          )}

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
