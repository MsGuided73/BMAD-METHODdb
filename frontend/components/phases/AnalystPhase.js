import { useState } from 'react';
import AIChat from '../AIChat';
import DocumentPreview from '../DocumentPreview';
import { DocumentIcon, CheckIcon, ChatIcon } from '../Icons';

export default function AnalystPhase({ session, phaseData, onComplete, onDataUpdate }) {
  const [mode, setMode] = useState('chat'); // chat, preview, complete
  const [generatedContent, setGeneratedContent] = useState(phaseData.generatedContent || '');
  const chatContext = {
    projectName: session.projectName,
    phase: 'analyst',
    sessionId: session.id
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

          <AIChat
            agentId="role-analyst-a-brainstorming-ba-and-ra-expert"
            phase="analyst"
            context={chatContext}
            onContentGenerated={handleContentGenerated}
          />
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
