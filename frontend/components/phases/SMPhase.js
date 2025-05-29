import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import AIChat from '../AIChat';
import DocumentPreview from '../DocumentPreview';
import ChecklistValidator from '../ChecklistValidator';
import { ClipboardListIcon, CheckIcon, ChatIcon } from '../Icons';

export default function SMPhase({ session, phaseData, onComplete, onDataUpdate }) {
  const [step, setStep] = useState('chat'); // chat, validation, complete
  const [generatedContent, setGeneratedContent] = useState(phaseData.generatedContent || '');
  const [checklistData, setChecklistData] = useState(phaseData.checklistData || null);

  // 📝 COMPREHENSIVE CONTEXT - All previous phase outputs for complete user story generation
  const chatContext = {
    projectName: session.projectName,
    projectBrief: session.phases?.analyst?.outputs?.find(o => o.type === 'project-brief')?.content || '',
    prd: session.phases?.pm?.outputs?.find(o => o.type === 'prd')?.content || '',
    architecture: session.phases?.architect?.outputs?.find(o => o.type === 'architecture')?.content || '',
    frontendArchitecture: session.phases?.designArchitect?.outputs?.find(o => o.type === 'frontend-architecture')?.content || '',
    uiuxSpec: session.phases?.designArchitect?.outputs?.find(o => o.type === 'uiux-spec')?.content || '',
    poValidation: session.phases?.po?.outputs?.find(o => o.type === 'po-validation')?.content || '',
    phase: 'sm',
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
      type: 'user-stories',
      content: generatedContent,
      filename: `${session.projectName.toLowerCase().replace(/\s+/g, '-')}-user-stories.md`
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
      description: 'Chat with your Scrum Master AI',
      icon: ChatIcon,
      color: 'blue'
    },
    {
      id: 'validation',
      name: 'Story Validation',
      description: 'Validate stories meet definition of done criteria',
      icon: ClipboardListIcon,
      color: 'yellow'
    },
    {
      id: 'complete',
      name: 'Phase Complete',
      description: 'All stories created and ready for development',
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">AI Scrum Master</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Create comprehensive user stories with acceptance criteria</li>
              <li>• Break down features into manageable, testable stories</li>
              <li>• Follow "As a... I want... So that..." format</li>
              <li>• Ask for user stories generation when ready</li>
            </ul>
          </div>

          {/* 📚 Complete Project Context for Story Creation */}
          <div className="space-y-4">
            <h4 className="font-medium text-blue-900 mb-3">📚 Complete Project Context for User Story Creation:</h4>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {session.phases?.analyst?.outputs?.find(o => o.type === 'project-brief') && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                  <h5 className="font-medium text-green-900 mb-2 flex items-center text-sm">
                    📋 Project Brief
                    <span className="ml-1 px-1 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                      Analyst
                    </span>
                  </h5>
                  <div className="text-xs text-green-700 max-h-20 overflow-y-auto bg-white bg-opacity-50 rounded p-2">
                    <ReactMarkdown>
                      {session.phases.analyst.outputs.find(o => o.type === 'project-brief').content.slice(0, 200)}...
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {session.phases?.pm?.outputs?.find(o => o.type === 'prd') && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-3">
                  <h5 className="font-medium text-orange-900 mb-2 flex items-center text-sm">
                    📋 PRD
                    <span className="ml-1 px-1 py-0.5 bg-orange-100 text-orange-800 text-xs rounded">
                      PM
                    </span>
                  </h5>
                  <div className="text-xs text-orange-700 max-h-20 overflow-y-auto bg-white bg-opacity-50 rounded p-2">
                    <ReactMarkdown>
                      {session.phases.pm.outputs.find(o => o.type === 'prd').content.slice(0, 200)}...
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {session.phases?.architect?.outputs?.find(o => o.type === 'architecture') && (
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-3">
                  <h5 className="font-medium text-purple-900 mb-2 flex items-center text-sm">
                    🏗️ Architecture
                    <span className="ml-1 px-1 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">
                      Architect
                    </span>
                  </h5>
                  <div className="text-xs text-purple-700 max-h-20 overflow-y-auto bg-white bg-opacity-50 rounded p-2">
                    <ReactMarkdown>
                      {session.phases.architect.outputs.find(o => o.type === 'architecture').content.slice(0, 200)}...
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {session.phases?.designArchitect?.outputs?.length > 0 && (
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-3">
                  <h5 className="font-medium text-pink-900 mb-2 flex items-center text-sm">
                    🎨 Frontend Design
                    <span className="ml-1 px-1 py-0.5 bg-pink-100 text-pink-800 text-xs rounded">
                      Design
                    </span>
                  </h5>
                  <div className="text-xs text-pink-700 max-h-20 overflow-y-auto bg-white bg-opacity-50 rounded p-2">
                    <ReactMarkdown>
                      {session.phases.designArchitect.outputs[0].content.slice(0, 200)}...
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {session.phases?.po?.outputs?.find(o => o.type === 'po-validation') && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3">
                  <h5 className="font-medium text-blue-900 mb-2 flex items-center text-sm">
                    ✅ PO Validation
                    <span className="ml-1 px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                      PO
                    </span>
                  </h5>
                  <div className="text-xs text-blue-700 max-h-20 overflow-y-auto bg-white bg-opacity-50 rounded p-2">
                    <ReactMarkdown>
                      {session.phases.po.outputs.find(o => o.type === 'po-validation').content.slice(0, 200)}...
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>

            {/* 📊 Complete Context Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h5 className="font-medium text-blue-900 mb-2">📊 Story Creation Context Status:</h5>
              <div className="flex flex-wrap gap-1">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  session.phases?.analyst?.outputs?.length > 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  ✓ Business Vision
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  session.phases?.pm?.outputs?.length > 0
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  ✓ Product Requirements
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  session.phases?.architect?.outputs?.length > 0
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  ✓ Technical Architecture
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  session.phases?.designArchitect?.outputs?.length > 0
                    ? 'bg-pink-100 text-pink-800'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  ✓ Frontend Design
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  session.phases?.po?.outputs?.length > 0
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  ✓ PO Validation
                </span>
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  🎯 Current: User Stories
                </span>
              </div>
            </div>
          </div>

          <AIChat
            agentId="role-scrum-master-agent"
            phase="sm"
            context={chatContext}
            onContentGenerated={handleContentGenerated}
          />
        </div>
      )}

      {step === 'validation' && generatedContent && (
        <div className="space-y-6">
          <DocumentPreview
            title="User Stories Document"
            content={generatedContent}
            filename={`${session.projectName.toLowerCase().replace(/\s+/g, '-')}-user-stories.md`}
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
            checklistName="story-definition-of-done-(dod)-checklist.md"
            title="Story Definition of Done Checklist"
            description="Validate all stories meet the definition of done criteria"
            onComplete={handleChecklistComplete}
          />
        </div>
      )}

      {step === 'complete' && (
        <div className="text-center space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <CheckIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Story Creation Complete
            </h3>
            <p className="text-green-700">
              All user stories have been created and validated. Ready for development!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Generated Stories</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Comprehensive user stories document created</li>
                <li>• All stories validated</li>
                <li>• Ready for development sprint</li>
              </ul>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
              <p className="text-sm text-gray-600">
                Download the complete project package with all documentation and agent prompts.
              </p>
            </div>
          </div>

          <button
            onClick={handleCompletePhase}
            className="btn btn-primary btn-lg"
          >
            Complete Scrum Master Phase
          </button>
        </div>
      )}
    </div>
  );
}
