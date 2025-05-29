import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useSession } from '../../contexts/SessionContext';
import ChecklistValidator from '../ChecklistValidator';
import DocumentPreview from '../DocumentPreview';
import { EyeIcon, ClipboardListIcon, CheckIcon } from '../Icons';

export default function POPhase({ session, phaseData, onComplete, onDataUpdate }) {
  const { checklists } = useSession();
  const [step, setStep] = useState('review'); // review, validation, complete
  const [checklistData, setChecklistData] = useState(phaseData.checklistData || null);
  const [reviewNotes, setReviewNotes] = useState(phaseData.reviewNotes || '');

  const handleReviewNotesChange = (notes) => {
    setReviewNotes(notes);
    onDataUpdate({ ...phaseData, reviewNotes: notes, step });
  };

  const handleProceedToValidation = () => {
    setStep('validation');
    onDataUpdate({ ...phaseData, reviewNotes, step: 'validation' });
  };

  const handleChecklistComplete = (checklistResults) => {
    setChecklistData(checklistResults);
    setStep('complete');
    onDataUpdate({ 
      ...phaseData, 
      reviewNotes,
      checklistData: checklistResults,
      step: 'complete' 
    });
  };

  const handleCompletePhase = () => {
    const outputs = [{
      type: 'po-validation',
      content: `# Product Owner Validation Report\n\n## Review Notes\n${reviewNotes}\n\n## Validation Results\nCompletion: ${checklistData?.completionPercentage}%\nValidated At: ${checklistData?.timestamp}`,
      filename: `${session.projectName.toLowerCase().replace(/\s+/g, '-')}-po-validation.md`
    }];

    onComplete({ 
      reviewNotes,
      checklistData,
      step: 'complete' 
    }, outputs);
  };

  const steps = [
    {
      id: 'review',
      name: 'Document Review',
      description: 'Review all project documentation and requirements',
      icon: EyeIcon,
      color: 'blue'
    },
    {
      id: 'validation',
      name: 'PO Validation',
      description: 'Complete comprehensive product owner validation',
      icon: ClipboardListIcon,
      color: 'yellow'
    },
    {
      id: 'complete',
      name: 'Phase Complete',
      description: 'All requirements validated and ready for story creation',
      icon: CheckIcon,
      color: 'green'
    }
  ];

  // Get all generated documents from previous phases
  const allDocuments = [
    ...(session.phases.analyst?.outputs || []),
    ...(session.phases.pm?.outputs || []),
    ...(session.phases.architect?.outputs || []),
    ...(session.phases.designArchitect?.outputs || [])
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
      {step === 'review' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Product Owner Review Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Review all project documentation for completeness and accuracy</li>
              <li>• Ensure requirements align with business objectives</li>
              <li>• Validate technical architecture meets business needs</li>
              <li>• Confirm UI/UX design supports user goals</li>
            </ul>
          </div>

          {/* Document Review Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Project Documentation Review</h4>
            
            {allDocuments.length > 0 ? (
              <div className="grid gap-4">
                {allDocuments.map((doc, index) => (
                  <DocumentPreview
                    key={index}
                    title={`${doc.type.charAt(0).toUpperCase() + doc.type.slice(1).replace('-', ' ')} Document`}
                    content={doc.content}
                    filename={doc.filename}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-gray-600">No documents available for review</p>
              </div>
            )}
          </div>

          {/* Review Notes */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Review Notes & Feedback</h4>
            <div className="space-y-2">
              <label className="form-label">
                Document your review findings, concerns, and approval notes
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => handleReviewNotesChange(e.target.value)}
                placeholder="Enter your review notes, feedback, and any concerns or approvals..."
                rows={6}
                className="form-textarea"
              />
            </div>
          </div>

          {reviewNotes.trim() && (
            <div className="flex justify-center">
              <button
                onClick={handleProceedToValidation}
                className="btn btn-primary btn-lg"
              >
                Proceed to Validation Checklist
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'validation' && (
        <div className="space-y-6">
          {reviewNotes && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Review Notes</h4>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {reviewNotes}
              </div>
            </div>
          )}
          
          <ChecklistValidator
            checklistName="product-owner-(po)-validation-checklist.md"
            title="Product Owner Master Validation Checklist"
            description="Complete comprehensive validation of all project requirements and documentation"
            onComplete={handleChecklistComplete}
          />
        </div>
      )}

      {step === 'complete' && (
        <div className="text-center space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <CheckIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Product Owner Validation Complete
            </h3>
            <p className="text-green-700">
              All requirements have been validated and approved. Ready for story creation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Validation Summary</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• All documentation reviewed</li>
                <li>• Requirements validated: {checklistData?.completionPercentage}%</li>
                <li>• Ready for story generation</li>
              </ul>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Next Phase</h4>
              <p className="text-sm text-gray-600">
                Scrum Master will create detailed user stories and acceptance criteria.
              </p>
            </div>
          </div>

          <button
            onClick={handleCompletePhase}
            className="btn btn-primary btn-lg"
          >
            Complete Product Owner Phase
          </button>
        </div>
      )}
    </div>
  );
}
