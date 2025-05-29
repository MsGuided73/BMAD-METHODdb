import { useState, useEffect } from 'react';
import { useSession } from '../../contexts/SessionContext';
import { DownloadIcon, SparklesIcon, CheckIcon, DocumentIcon } from '../Icons';

export default function CompletionPhase({ session, phaseData, onComplete, onDataUpdate }) {
  const { api } = useSession();
  const [packageData, setPackageData] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);

  useEffect(() => {
    generatePackage();
  }, []);

  const generatePackage = async () => {
    setGenerating(true);
    try {
      const result = await api.generatePackage(session.id);
      setPackageData(result);
      setDownloadUrl(result.downloadUrl);
    } catch (error) {
      console.error('Failed to generate package:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPackage = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  const handleCompleteSession = () => {
    onComplete({ packageGenerated: true, downloadUrl }, []);
  };

  // Collect all outputs from all phases
  const allOutputs = [
    ...(session.phases.analyst?.outputs || []),
    ...(session.phases.pm?.outputs || []),
    ...(session.phases.architect?.outputs || []),
    ...(session.phases.designArchitect?.outputs || []),
    ...(session.phases.po?.outputs || []),
    ...(session.phases.sm?.outputs || [])
  ];

  const documentTypes = {
    'project-brief': 'Project Brief',
    'prd': 'Product Requirements Document',
    'architecture': 'System Architecture',
    'frontend-architecture': 'Frontend Architecture',
    'uiux-spec': 'UI/UX Specification',
    'po-validation': 'Product Owner Validation',
    'story': 'User Story'
  };

  const groupedOutputs = allOutputs.reduce((acc, output) => {
    const type = output.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(output);
    return acc;
  }, {});

  return (
    <div className="p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <SparklesIcon className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🎉 BMAD Planning Complete!
        </h2>
        <p className="text-lg text-gray-600">
          Your comprehensive project package is ready for development
        </p>
      </div>

      {generating ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Generating Your Project Package
          </h3>
          <p className="text-gray-600">
            Creating documentation, agent prompts, and organizing files...
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Package Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <CheckIcon className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-green-900">
                Package Generation Complete
              </h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Object.keys(groupedOutputs).length}
                </div>
                <div className="text-sm text-green-700">Document Types</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {allOutputs.length}
                </div>
                <div className="text-sm text-green-700">Total Files</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {packageData?.agentPrompts?.length || 6}
                </div>
                <div className="text-sm text-green-700">Agent Prompts</div>
              </div>
            </div>
          </div>

          {/* Generated Documents */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Generated Documentation
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(groupedOutputs).map(([type, outputs]) => (
                <div key={type} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <DocumentIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <h4 className="font-medium text-gray-900">
                      {documentTypes[type] || type}
                    </h4>
                  </div>
                  <div className="text-sm text-gray-600">
                    {outputs.length} file{outputs.length > 1 ? 's' : ''}
                  </div>
                  <ul className="mt-2 space-y-1">
                    {outputs.map((output, index) => (
                      <li key={index} className="text-xs text-gray-500 truncate">
                        {output.filename || output.title || `${type}-${index + 1}`}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Prompts */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              LLM-Ready Agent Prompts
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packageData?.agentPrompts?.map((agent, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{agent.role}</h4>
                  <p className="text-sm text-gray-600 mb-2">{agent.description}</p>
                  <div className="text-xs text-gray-500">
                    {agent.filename}
                  </div>
                </div>
              )) || (
                <div className="col-span-full text-center text-gray-500">
                  Agent prompts will be included in the download package
                </div>
              )}
            </div>
          </div>

          {/* Package Contents */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              What's Included in Your Package
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">📋 Project Documentation</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Project Brief & Research</li>
                  <li>• Product Requirements Document (PRD)</li>
                  <li>• System Architecture Specifications</li>
                  <li>• Frontend Architecture & UI/UX Design</li>
                  <li>• User Stories & Acceptance Criteria</li>
                  <li>• Validation Checklists & Reports</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">🤖 AI Development Agents</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Backend Developer Agent</li>
                  <li>• Frontend Developer Agent</li>
                  <li>• Database Designer Agent</li>
                  <li>• DevOps Engineer Agent</li>
                  <li>• QA Testing Agent</li>
                  <li>• Project Manager Agent</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Download Section */}
          <div className="bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ready to Start Development?
            </h3>
            <p className="text-gray-600 mb-6">
              Download your complete project package and start building with AI-powered development agents.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleDownloadPackage}
                disabled={!downloadUrl}
                className="btn btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DownloadIcon className="h-5 w-5 mr-2" />
                Download Project Package
              </button>
              
              <button
                onClick={handleCompleteSession}
                className="btn btn-outline btn-lg"
              >
                Complete Session
              </button>
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🚀 From Vibe to Professional Development
            </h3>
            <p className="text-gray-600">
              You've successfully transformed your project idea through the complete BMAD Method process. 
              Your project is now ready for professional AI-assisted development!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
